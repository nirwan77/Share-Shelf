import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const validStatuses: ReportStatus[] = ['PENDING', 'RESOLVED', 'DISMISSED'];
    const where: Prisma.ReportWhereInput =
      status && validStatuses.includes(status as ReportStatus)
        ? { status: status as ReportStatus }
        : {};

    const [total, reports] = await Promise.all([
      this.prisma.report.count({ where }),
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          reportedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isBanned: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              content: true,
              image: true,
              createdAt: true,
            },
          },
          comment: {
            select: {
              id: true,
              comment: true,
              postId: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async resolveReport(id: string) {
    return this.prisma.report.update({
      where: { id },
      data: { status: 'RESOLVED' },
    });
  }

  async dismissReport(id: string) {
    return this.prisma.report.update({
      where: { id },
      data: { status: 'DISMISSED' },
    });
  }

  async findDeletedComments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      this.prisma.deletedComment.count(),
      this.prisma.deletedComment.findMany({
        skip,
        take: limit,
        orderBy: { deletedAt: 'desc' },
      }),
    ]);

    return {
      data: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deletePost(postId: string) {
    const post = await this.prisma.posts.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.posts.delete({
      where: { id: postId },
    });
  }

  async deleteComment(commentId: string, dashboardUserId?: string) {
    const comment = await this.prisma.postComments.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: { id: true, title: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.deletedComment.upsert({
        where: { commentId: comment.id },
        update: {
          comment: comment.comment,
          postId: comment.postId,
          postTitle: comment.post.title,
          userId: comment.userId,
          userName: comment.user?.name,
          userEmail: comment.user?.email,
          deletedByDashboardUserId: dashboardUserId,
          deletedAt: new Date(),
        },
        create: {
          commentId: comment.id,
          comment: comment.comment,
          postId: comment.postId,
          postTitle: comment.post.title,
          userId: comment.userId,
          userName: comment.user?.name,
          userEmail: comment.user?.email,
          deletedByDashboardUserId: dashboardUserId,
        },
      });

      return tx.postComments.delete({
        where: { id: commentId },
      });
    });
  }

  async banUser(userId: string) {
    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { isBanned: true },
      }),
      this.prisma.report.updateMany({
        where: { reportedUserId: userId, status: 'PENDING' },
        data: { status: 'RESOLVED' },
      }),
    ]);
  }
}
