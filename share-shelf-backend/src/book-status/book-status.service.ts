import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookStatus } from '@prisma/client';

@Injectable()
export class BookStatusService {
  constructor(private prisma: PrismaService) {}

  async toggleStatus(userId: string, data: { bookId: string; status: BookStatus }) {
    const existing = await this.prisma.userBookStatus.findFirst({
      where: {
        userId,
        bookId: data.bookId,
      },
    });

    if (existing) {
      if (existing.status === data.status) {
        // Toggle off if the same status is applied
        await this.prisma.userBookStatus.delete({
          where: { id: existing.id },
        });
        return { message: 'Status removed' };
      } else {
        // Change to another status
        return this.prisma.userBookStatus.update({
          where: { id: existing.id },
          data: { status: data.status },
        });
      }
    }

    // Create a new status
    return this.prisma.userBookStatus.create({
      data: {
        userId,
        bookId: data.bookId,
        status: data.status,
      },
    });
  }
}
