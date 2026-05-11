import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookStatus } from '@prisma/client';
import { ReadingGoalsService } from '../reading-goals/reading-goals.service';

@Injectable()
export class BookStatusService {
  constructor(
    private prisma: PrismaService,
    private readingGoalsService: ReadingGoalsService,
  ) {}

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
        const updatedStatus = await this.prisma.userBookStatus.update({
          where: { id: existing.id },
          data: { status: data.status },
        });

        if (data.status === 'READ') {
          await this.readingGoalsService.evaluateReadingAchievements(userId);
        }

        return updatedStatus;
      }
    }

    // Create a new status
    const createdStatus = await this.prisma.userBookStatus.create({
      data: {
        userId,
        bookId: data.bookId,
        status: data.status,
      },
    });

    if (data.status === 'READ') {
      await this.readingGoalsService.evaluateReadingAchievements(userId);
    }

    return createdStatus;
  }
}
