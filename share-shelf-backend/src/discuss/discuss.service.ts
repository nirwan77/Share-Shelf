import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  FeedFilter,
  FeedQueryDto,
  FeedSortBy,
  FeedTimeRange,
} from './dto/feed-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DiscussService {
  constructor(private prisma: PrismaService) {}

  async getFeed(query: FeedQueryDto, userId?: string) {
    const { filter, timeRange, sortBy } = query;

    // Build the WHERE clause for Prisma
    const where: Prisma.PostsWhereInput = {};

    // 1. User-based filters
    if (filter === FeedFilter.MY_POSTS) {
      if (!userId) return [];
      where.createdById = userId;
    } else if (filter === FeedFilter.FOLLOWING) {
      if (!userId) return [];
      where.createdByUser = {
        followers: {
          some: {
            followerId: userId,
          },
        },
      };
    }

    // 2. Time-range filters
    if (timeRange && timeRange !== FeedTimeRange.ALL_TIME) {
      const now = new Date();
      let startDate: Date;
      switch (timeRange) {
        case FeedTimeRange.TODAY:
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case FeedTimeRange.THIS_WEEK:
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          startDate = oneWeekAgo;
          break;
        case FeedTimeRange.THIS_MONTH:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case FeedTimeRange.THIS_YEAR:
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case FeedTimeRange.LAST_YEAR:
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          break;
      }
      if (startDate) {
        where.createdAt = { gte: startDate };
      }
    }

    // 3. Sorting logic
    // We use Prisma for common sorts (latest, most liked, etc.)

    const select = {
      id: true,
      _count: { select: { comments: true, reactions: true } },
      content: true,
      image: true,
      viewsCount: true,
      createdByUser: {
        select: {
          id: true,
          avatar: true,
          name: true,
        },
      },
      title: true,
      createdAt: true,
      reactions: {
        where: { userId: userId || '' },
        select: { id: true },
      },
    };

    const orderByMapping: any = {
      [FeedSortBy.LATEST]: { createdAt: 'desc' },
      [FeedSortBy.MOST_COMMENTED]: { comments: { _count: 'desc' } },
      [FeedSortBy.MOST_LIKED]: { reactions: { _count: 'desc' } },
    };
    const orderBy = orderByMapping[sortBy || FeedSortBy.LATEST] || {
      createdAt: 'desc',
    };

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const posts = await this.prisma.posts.findMany({
      where,
      select,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.posts.count({ where });

    return {
      posts: posts.map((post: any) => ({
        ...post,
        isLikedByMe: post.reactions.length > 0,
        reactions: undefined,
      })),
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async createPost(data: {
    title: string;
    content?: string;
    image?: string;
    createdById: string;
  }) {
    return this.prisma.posts.create({
      data: {
        title: data.title,
        content: data.content,
        image: data.image,
        createdById: data.createdById,
      },
    });
  }

  async findOne(postId: string, currentUserId: string) {
    await this.prisma.posts.update({
      where: { id: postId },
      data: { viewsCount: { increment: 1 } },
    });

    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
      select: {
        _count: { select: { comments: true, reactions: true } },
        title: true,
        content: true,
        image: true,
        viewsCount: true,
        createdByUser: { select: { id: true, avatar: true, name: true } },
        mentions: { select: { id: true, userId: true } },
        reactions: { select: { id: true, reaction: true, userId: true } },
        comments: {
          select: {
            id: true,
            comment: true,
            user: { select: { id: true, name: true, avatar: true } },
            createdAt: true,
            _count: { select: { postCommentReactions: true } }, // ← add
            postCommentReactions: { select: { userId: true, reaction: true } }, // ← add
          },
          orderBy: { createdAt: 'asc' },
        },
        createdAt: true,
        createdById: true,
      },
    });

    if (!post) return null;

    const isLikedByMe = (post as any).reactions.some(
      (r: any) => r.userId === currentUserId,
    );

    return {
      ...post,
      isLikedByMe,
      comments: (post as any).comments.map(
        ({ postCommentReactions, ...comment }: any) => ({
          ...comment,
          isLikedByMe: postCommentReactions.some(
            (r: any) => r.userId === currentUserId && r.reaction === 'like',
          ),
        }),
      ),
    };
  }

  async findComments(postId: string, currentUserId: string) {
    const comments = await this.prisma.postComments.findMany({
      where: { postId },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { postCommentReactions: true } },
        postCommentReactions: { select: { userId: true, reaction: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map(({ postCommentReactions, _count, ...comment }) => ({
      ...comment,
      isLikedByMe: postCommentReactions.some(
        (r) => r.userId === currentUserId && r.reaction === 'like',
      ),
      _count: { reactions: _count.postCommentReactions },
    }));
  }

  async addComment(
    postId: string,
    userId: string,
    comment: string,
    parentCommentId?: string,
  ) {
    return this.prisma.postComments.create({
      data: {
        postId,
        userId,
        comment,
        parentCommentId: parentCommentId || null,
      },
    });
  }

  async togglePostReaction(postId: string, userId: string) {
    const reaction = 'like';

    const existing = await this.prisma.postReactions.findUnique({
      where: { postId_userId_reaction: { postId, userId, reaction } },
    });

    if (existing) {
      await this.prisma.postReactions.delete({
        where: { id: existing.id },
      });
      return { action: 'removed' };
    }

    const newReaction = await this.prisma.postReactions.create({
      data: {
        postId,
        userId,
        reaction,
      },
    });

    return { action: 'added', reaction: newReaction };
  }

  async deletePost(postId: string, userId: string) {
    return this.prisma.posts.delete({
      where: {
        id: postId,
        createdById: userId,
      },
    });
  }

  async updatePost(
    postId: string,
    userId: string,
    data: { title?: string; content?: string; image?: string },
  ) {
    return this.prisma.posts.update({
      where: {
        id: postId,
        createdById: userId,
      },
      data,
    });
  }

  async toggleCommentReaction(
    commentId: string,
    userId: string,
    reaction: string,
  ) {
    const existing = await this.prisma.postCommentReactions.findUnique({
      where: {
        postCommentId_userId_reaction: {
          postCommentId: commentId,
          userId,
          reaction,
        },
      },
    });

    if (existing) {
      // already liked/reacted → remove it (dislike/unreact)
      await this.prisma.postCommentReactions.delete({
        where: { id: existing.id },
      });
      return { action: 'removed' };
    }

    // otherwise create reaction
    const newReaction = await this.prisma.postCommentReactions.create({
      data: {
        postCommentId: commentId,
        userId,
        reaction,
      },
    });

    return { action: 'added', reaction: newReaction };
  }

  async deleteComment(commentId: string) {
    return this.prisma.postComments.delete({
      where: { id: commentId },
    });
  }
}
