import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

const READING_MILESTONES = [1, 5, 10, 25, 50];

@Injectable()
export class ReadingGoalsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getSummary(userId: string) {
    const year = new Date().getFullYear();
    await this.evaluateReadingAchievements(userId, year);

    const [goal, readCount, achievements] = await Promise.all([
      this.prisma.readingGoal.findUnique({
        where: { userId_year: { userId, year } },
      }),
      this.countReadBooks(userId, year),
      this.prisma.readingAchievement.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const targetBooks = goal?.targetBooks ?? null;

    return {
      year,
      goal,
      readCount,
      targetBooks,
      progressPercent: targetBooks
        ? Math.min(100, Math.round((readCount / targetBooks) * 100))
        : 0,
      remainingBooks: targetBooks ? Math.max(targetBooks - readCount, 0) : null,
      nextMilestone:
        READING_MILESTONES.find((milestone) => milestone > readCount) ?? null,
      achievements,
    };
  }

  async setGoal(userId: string, targetBooks: number, year?: number) {
    const goalYear = year ?? new Date().getFullYear();
    const normalizedTarget = Number(targetBooks);

    if (!Number.isInteger(normalizedTarget) || normalizedTarget < 1) {
      throw new BadRequestException('Target books must be a positive whole number');
    }

    if (normalizedTarget > 1000) {
      throw new BadRequestException('Target books cannot be greater than 1000');
    }

    await this.prisma.readingGoal.upsert({
      where: { userId_year: { userId, year: goalYear } },
      update: { targetBooks: normalizedTarget },
      create: {
        userId,
        year: goalYear,
        targetBooks: normalizedTarget,
      },
    });

    await this.evaluateReadingAchievements(userId, goalYear);

    return this.getSummary(userId);
  }

  async evaluateReadingAchievements(userId: string, year = new Date().getFullYear()) {
    const [readCount, goal] = await Promise.all([
      this.countReadBooks(userId, year),
      this.prisma.readingGoal.findUnique({
        where: { userId_year: { userId, year } },
      }),
    ]);

    const achievements = READING_MILESTONES.filter(
      (milestone) => readCount >= milestone,
    ).map((milestone) => ({
      userId,
      type: `READING_MILESTONE_${milestone}`,
      title: `${milestone} ${milestone === 1 ? 'Book' : 'Books'} Read`,
      description: `Completed ${milestone} ${milestone === 1 ? 'book' : 'books'} in ${year}.`,
      year,
      threshold: milestone,
    }));

    if (goal && readCount >= goal.targetBooks) {
      achievements.push({
        userId,
        type: `READING_GOAL_${year}`,
        title: `${year} Reading Goal Completed`,
        description: `Completed the personal challenge of reading ${goal.targetBooks} ${goal.targetBooks === 1 ? 'book' : 'books'} in ${year}.`,
        year,
        threshold: goal.targetBooks,
      });
    }

    if (achievements.length === 0) {
      return { count: 0 };
    }

    const result = await this.prisma.readingAchievement.createMany({
      data: achievements,
      skipDuplicates: true,
    });

    if (result.count > 0) {
      await this.notifications.create(
        userId,
        `You unlocked ${result.count} new reading ${result.count === 1 ? 'achievement' : 'achievements'}.`,
        'READING_ACHIEVEMENT',
      );
    }

    return result;
  }

  private countReadBooks(userId: string, year: number) {
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));

    return this.prisma.userBookStatus.count({
      where: {
        userId,
        status: 'READ',
        updatedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }
}
