import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import {
  LeaderboardCategory,
  LeaderboardQueryDto,
  LeaderboardTimeRange,
} from './dto/leaderboard-query.dto';

type LeaderboardRow = {
  userId: string;
  username: string;
  avatar: string | null;
  score: bigint;
  rank: bigint;
};

type LeaderboardUser = {
  id: string;
  username: string;
  avatar: string | null;
  score: number;
  rank: number;
  badge: string;
  trend: number;
  isCurrentUser: boolean;
};

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(query: LeaderboardQueryDto, currentUserId?: string) {
    const category = query.category ?? 'exchanged';
    const timeRange = query.timeRange ?? 'all';
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const search = query.search?.trim().toLowerCase() ?? '';

    const rows = await this.getRankedRows(category, timeRange);
    const users = rows.map((row) =>
      this.toLeaderboardUser(row, category, currentUserId),
    );

    const filtered = search
      ? users.filter((user) => user.username.toLowerCase().includes(search))
      : users;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    const currentUser = currentUserId
      ? users.find((user) => user.id === currentUserId) ?? null
      : null;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      category,
      timeRange,
      currentUser,
      currentUserId: currentUserId ?? null,
      generatedAt: new Date().toISOString(),
    };
  }

  private getPeriodFilter(timeRange: LeaderboardTimeRange, alias: string) {
    const now = new Date();

    if (timeRange === 'month') {
      return Prisma.sql`AND ${Prisma.raw(alias)}."createdAt" >= ${new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      )}`;
    }

    if (timeRange === 'year') {
      return Prisma.sql`AND ${Prisma.raw(alias)}."createdAt" >= ${new Date(
        now.getFullYear(),
        0,
        1,
      )}`;
    }

    return Prisma.empty;
  }

  private async getRankedRows(
    category: LeaderboardCategory,
    timeRange: LeaderboardTimeRange,
  ) {
    const scoreQuery = this.getScoreQuery(category, timeRange);

    return this.prisma.$queryRaw<LeaderboardRow[]>`
      WITH scores AS (${scoreQuery}),
      totals AS (
        SELECT "userId", SUM(score)::bigint AS score
        FROM scores
        GROUP BY "userId"
      )
      SELECT
        u.id AS "userId",
        u.name AS username,
        u.avatar AS avatar,
        totals.score AS score,
        RANK() OVER (ORDER BY totals.score DESC, u."createdAt" ASC)::bigint AS rank
      FROM totals
      INNER JOIN "User" u ON u.id = totals."userId"
      WHERE totals.score > 0
      ORDER BY rank ASC, username ASC
    `;
  }

  private getScoreQuery(
    category: LeaderboardCategory,
    timeRange: LeaderboardTimeRange,
  ) {
    if (category === 'reviews') {
      return Prisma.sql`
        SELECT r."userId", COUNT(*)::bigint AS score
        FROM "UserBookReview" r
        WHERE 1 = 1 ${this.getPeriodFilter(timeRange, 'r')}
        GROUP BY r."userId"
      `;
    }

    if (category === 'comments') {
      return Prisma.sql`
        SELECT c."userId", COUNT(*)::bigint AS score
        FROM "post_comments" c
        WHERE c."userId" IS NOT NULL ${this.getPeriodFilter(timeRange, 'c')}
        GROUP BY c."userId"
      `;
    }

    if (category === 'likes') {
      return Prisma.sql`
        SELECT r."userId", COUNT(*)::bigint AS score
        FROM "ReviewVote" rv
        INNER JOIN "UserBookReview" r ON r.id = rv."reviewId"
        WHERE rv."voteType" = 'UPVOTE' ${this.getPeriodFilter(timeRange, 'rv')}
        GROUP BY r."userId"

        UNION ALL

        SELECT p."createdById" AS "userId", COUNT(*)::bigint AS score
        FROM "post_reactions" pr
        INNER JOIN "posts" p ON p.id = pr."postId"
        WHERE pr.reaction = 'UPVOTE' ${this.getPeriodFilter(timeRange, 'pr')}
        GROUP BY p."createdById"

        UNION ALL

        SELECT c."userId", COUNT(*)::bigint AS score
        FROM "post_comment_reactions" cr
        INNER JOIN "post_comments" c ON c.id = cr."postCommentId"
        WHERE c."userId" IS NOT NULL
          AND cr.reaction = 'UPVOTE'
          ${this.getPeriodFilter(timeRange, 'cr')}
        GROUP BY c."userId"
      `;
    }

    return Prisma.sql`
      SELECT bp."buyerId" AS "userId", COUNT(*)::bigint AS score
      FROM "BookPurchase" bp
      WHERE bp.status IN ('PAID', 'COMPLETED')
        ${this.getPeriodFilter(timeRange, 'bp')}
      GROUP BY bp."buyerId"

      UNION ALL

      SELECT bp."sellerId" AS "userId", COUNT(*)::bigint AS score
      FROM "BookPurchase" bp
      WHERE bp.status IN ('PAID', 'COMPLETED')
        ${this.getPeriodFilter(timeRange, 'bp')}
      GROUP BY bp."sellerId"
    `;
  }

  private toLeaderboardUser(
    row: LeaderboardRow,
    category: LeaderboardCategory,
    currentUserId?: string,
  ): LeaderboardUser {
    const score = Number(row.score);
    const rank = Number(row.rank);

    return {
      id: row.userId,
      username: row.username,
      avatar: row.avatar,
      score,
      rank,
      badge: this.getBadge(rank, category),
      trend: this.getTrend(score, rank),
      isCurrentUser: row.userId === currentUserId,
    };
  }

  private getBadge(rank: number, category: LeaderboardCategory) {
    if (rank === 1) return 'Community Champion';
    if (rank === 2) return 'Top Contributor';
    if (rank === 3) return 'Podium Finisher';

    const badges: Record<LeaderboardCategory, string> = {
      exchanged: 'Trusted Trader',
      reviews: 'Review Pro',
      likes: 'Reader Favorite',
      comments: 'Conversation Starter',
    };

    return badges[category];
  }

  private getTrend(score: number, rank: number) {
    return Math.max(1, Math.min(24, Math.round(score / 10) + (6 - rank)));
  }
}
