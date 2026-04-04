import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookRequestStatus, Prisma } from '@prisma/client';

@Injectable()
export class DashboardBookRequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { page?: number; limit?: number; status?: BookRequestStatus }) {
    const { page = 1, limit = 10, status } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.BookRequestWhereInput = {};
    if (status) {
      where.status = status;
    }

    const data = await this.prisma.bookRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const total = await this.prisma.bookRequest.count({ where });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: BookRequestStatus) {
    try {
      return await this.prisma.bookRequest.update({
        where: { id },
        data: { status },
      });
    } catch (e) {
      throw new NotFoundException('Book request not found');
    }
  }
}
