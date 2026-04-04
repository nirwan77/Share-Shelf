import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      title: string;
      author: string;
      description?: string;
      image?: string;
    },
  ) {
    return this.prisma.bookRequest.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findMyRequests(userId: string) {
    return this.prisma.bookRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
