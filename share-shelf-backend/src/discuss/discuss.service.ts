import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DiscussService {
  constructor(private prisma: PrismaService) {}

  async findAll(sortBy: string, sortOrder: 'asc' | 'desc', userId: string) {
    const orderBy =
      sortBy === 'popular'
        ? { mentions: { _count: sortOrder } }
        : { createdAt: sortOrder };

    const posts = await this.prisma.posts.findMany({
      select: {
        id: true,
        _count: { select: { comments: true, reactions: true } },
        content: true,
        image: true,
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
          where: { userId },
          select: { id: true },
        },
      },
      orderBy,
    });

    return posts.map((post) => ({
      ...post,
      isLikedByMe: post.reactions.length > 0,
      reactions: undefined,
    }));
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

  async findOne(postId: string) {
    return this.prisma.posts.findUnique({
      where: { id: postId },
      select: {
        _count: { select: { comments: true, reactions: true } },
        content: true,
        image: true,
        createdByUser: { select: { id: true, avatar: true, name: true } },
        mentions: { select: { id: true, userId: true } },
        reactions: { select: { id: true, reaction: true, userId: true } },
        comments: {
          select: {
            id: true,
            comment: true,
            user: { select: { id: true, name: true, avatar: true } },
            createdAt: true,
          },
        },
        createdAt: true,
      },
    });
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

  async deletePost(postId: string) {
    return this.prisma.posts.delete({
      where: { id: postId },
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
