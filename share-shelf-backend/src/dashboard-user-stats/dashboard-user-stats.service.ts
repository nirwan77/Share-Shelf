import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardUserStatsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              userBookStatuses: true,
              posts: true,
              payments: true,
            },
          },
        },
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userBookStatuses: true,
            userBookReviews: true,
            posts: true,
            postComments: true,
            payments: true,
          },
        },
      },
    });

    if (!user) return null;

    const [bookStatusCounts, paymentStats, recentPayments] = await Promise.all([
      this.prisma.userBookStatus.groupBy({
        by: ['status'],
        where: { userId: id },
        _count: { status: true },
      }),
      this.prisma.payment.aggregate({
        where: { userId: id, status: 'SUCCESS' },
        _sum: { total_amount: true },
        _count: { id: true },
      }),
      this.prisma.payment.findMany({
        where: { userId: id },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      user,
      stats: {
        bookStatuses: bookStatusCounts,
        payments: {
          totalAmount: paymentStats._sum.total_amount || 0,
          successCount: paymentStats._count.id,
        },
        recentPayments,
      },
    };
  }
}
