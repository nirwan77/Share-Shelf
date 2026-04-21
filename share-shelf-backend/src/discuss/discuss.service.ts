import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import {
  FeedFilter,
  FeedQueryDto,
  FeedSortBy,
  FeedTimeRange,
} from './dto/feed-query.dto';
import { ReportContentDto } from './dto/report-content.dto';

type DiscussVoteType = 'UPVOTE' | 'DOWNVOTE';

@Injectable()
export class DiscussService {
  constructor(private prisma: PrismaService) {}

  private assertValidReaction(reaction: string): asserts reaction is DiscussVoteType {
    if (reaction !== 'UPVOTE' && reaction !== 'DOWNVOTE') {
      throw new BadRequestException('Reaction must be UPVOTE or DOWNVOTE');
    }
  }

  private getVoteCounts(reactions: Array<{ reaction: string }>) {
    return reactions.reduce(
      (acc, current) => {
        if (current.reaction === 'UPVOTE') acc.upvotes += 1;
        if (current.reaction === 'DOWNVOTE') acc.downvotes += 1;
        return acc;
      },
      { upvotes: 0, downvotes: 0 },
    );
  }

  async getFeed(query: FeedQueryDto, userId?: string) {
    const { filter, timeRange, sortBy } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const emptyFeed = {
      posts: [],
      meta: {
        total: 0,
        page,
        limit,
      },
    };

    const where: Prisma.PostsWhereInput = {};

    if (filter === FeedFilter.MY_POSTS) {
      if (!userId) return emptyFeed;
      where.createdById = userId;
    } else if (filter === FeedFilter.FOLLOWING) {
      if (!userId) return emptyFeed;
      where.createdByUser = {
        followers: {
          some: {
            followerId: userId,
          },
        },
      };
    }

    if (timeRange && timeRange !== FeedTimeRange.ALL_TIME) {
      const now = new Date();
      let startDate: Date;
      switch (timeRange) {
        case FeedTimeRange.TODAY:
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case FeedTimeRange.THIS_WEEK:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
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

    const select = {
      id: true,
      _count: { select: { comments: true } },
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
        select: { reaction: true, userId: true },
      },
    };

    const total = await this.prisma.posts.count({ where });
    const skip = (page - 1) * limit;

    const orderByMapping: Record<string, Prisma.PostsOrderByWithRelationInput> =
      {
        [FeedSortBy.LATEST]: { createdAt: 'desc' },
        [FeedSortBy.MOST_COMMENTED]: { comments: { _count: 'desc' } },
      };

    const posts =
      sortBy === FeedSortBy.MOST_LIKED
        ? (
            await this.prisma.posts.findMany({
              where,
              select,
              orderBy: { createdAt: 'desc' },
            })
          )
            .sort((first, second) => {
              const firstUpvotes = this.getVoteCounts(first.reactions).upvotes;
              const secondUpvotes = this.getVoteCounts(second.reactions).upvotes;

              if (secondUpvotes !== firstUpvotes) {
                return secondUpvotes - firstUpvotes;
              }

              return second.createdAt.getTime() - first.createdAt.getTime();
            })
            .slice(skip, skip + limit)
        : await this.prisma.posts.findMany({
            where,
            select,
            orderBy: orderByMapping[sortBy || FeedSortBy.LATEST] || {
              createdAt: 'desc',
            },
            skip,
            take: limit,
          });

    return {
      posts: posts.map((post) => ({
        ...post,
        ...this.getVoteCounts(post.reactions),
        myVote:
          post.reactions.find((reaction) => reaction.userId === userId)
            ?.reaction ?? null,
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
        _count: { select: { comments: true } },
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
            postCommentReactions: { select: { userId: true, reaction: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        createdAt: true,
        createdById: true,
      },
    });

    if (!post) return null;

    return {
      ...post,
      ...this.getVoteCounts(post.reactions),
      myVote:
        post.reactions.find((reaction) => reaction.userId === currentUserId)
          ?.reaction ?? null,
      comments: post.comments.map(({ postCommentReactions, ...comment }) => ({
        ...comment,
        ...this.getVoteCounts(postCommentReactions),
        myVote:
          postCommentReactions.find((reaction) => reaction.userId === currentUserId)
            ?.reaction ?? null,
      })),
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
        postCommentReactions: { select: { userId: true, reaction: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map(({ postCommentReactions, ...comment }) => ({
      ...comment,
      ...this.getVoteCounts(postCommentReactions),
      myVote:
        postCommentReactions.find((reaction) => reaction.userId === currentUserId)
          ?.reaction ?? null,
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

  async togglePostReaction(
    postId: string,
    userId: string,
    reaction: DiscussVoteType,
  ) {
    this.assertValidReaction(reaction);

    const existing = await this.prisma.postReactions.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      if (existing.reaction === reaction) {
        await this.prisma.postReactions.delete({
          where: { id: existing.id },
        });
        return { action: 'removed' };
      }

      const updatedReaction = await this.prisma.postReactions.update({
        where: { id: existing.id },
        data: { reaction },
      });
      return { action: 'changed', reaction: updatedReaction };
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

  async reportPost(postId: string, reporterId: string, body: ReportContentDto) {
    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
      select: { id: true, createdById: true },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    if (post.createdById === reporterId) {
      throw new BadRequestException('You cannot report your own post');
    }

    return this.prisma.report.upsert({
      where: {
        reporterId_postId: {
          reporterId,
          postId,
        },
      },
      update: {
        reason: body.reason,
        details: body.details,
        status: 'PENDING',
      },
      create: {
        targetType: 'POST',
        reason: body.reason,
        details: body.details,
        reporterId,
        reportedUserId: post.createdById,
        postId,
      },
    });
  }

  async reportComment(
    commentId: string,
    reporterId: string,
    body: ReportContentDto,
  ) {
    const comment = await this.prisma.postComments.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });

    if (!comment?.userId) {
      throw new BadRequestException('Comment not found');
    }

    if (comment.userId === reporterId) {
      throw new BadRequestException('You cannot report your own comment');
    }

    return this.prisma.report.upsert({
      where: {
        reporterId_commentId: {
          reporterId,
          commentId,
        },
      },
      update: {
        reason: body.reason,
        details: body.details,
        status: 'PENDING',
      },
      create: {
        targetType: 'COMMENT',
        reason: body.reason,
        details: body.details,
        reporterId,
        reportedUserId: comment.userId,
        commentId,
      },
    });
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
    reaction: DiscussVoteType,
  ) {
    this.assertValidReaction(reaction);

    const existing = await this.prisma.postCommentReactions.findUnique({
      where: {
        postCommentId_userId: {
          postCommentId: commentId,
          userId,
        },
      },
    });

    if (existing) {
      if (existing.reaction === reaction) {
        await this.prisma.postCommentReactions.delete({
          where: { id: existing.id },
        });
        return { action: 'removed' };
      }

      const updatedReaction = await this.prisma.postCommentReactions.update({
        where: { id: existing.id },
        data: { reaction },
      });
      return { action: 'changed', reaction: updatedReaction };
    }

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
