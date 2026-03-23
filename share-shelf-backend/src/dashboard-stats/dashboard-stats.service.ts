import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardStatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalBooks,
      totalGenres,
      totalPosts,
      revenueResult,
      booksByStatus,
      recentUsers,
      recentBooks,
      recentPayments,
    ] = await Promise.all([
      // Aggregates
      this.prisma.user.count(),
      this.prisma.books.count(),
      this.prisma.genre.count(),
      this.prisma.posts.count(),
      this.prisma.payment.aggregate({
        _sum: { total_amount: true },
        where: { status: 'SUCCESS' },
      }),
      this.prisma.userBookStatus.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),

      // Recent Data
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
          isVerified: true,
        },
      }),
      this.prisma.books.findMany({
        take: 5,
        orderBy: { releaseDate: 'desc' },
        select: {
          id: true,
          name: true,
          author: true,
          image: true,
          price: true,
          releaseDate: true,
        },
      }),
      this.prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          transaction_uuid: true,
          total_amount: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = revenueResult._sum.total_amount || 0;

    return {
      overview: {
        totalUsers,
        totalBooks,
        totalGenres,
        totalPosts,
        totalRevenue,
      },
      booksByStatus,
      recent: {
        users: recentUsers,
        books: recentBooks,
        payments: recentPayments,
      },
    };
  }
}
