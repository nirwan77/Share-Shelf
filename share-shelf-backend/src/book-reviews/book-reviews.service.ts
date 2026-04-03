import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBookReviewDto } from './dto/create-book-review.dto';

@Injectable()
export class BookReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookReviewDto) {
    const existing = await this.prisma.userBookReview.findFirst({
      where: {
        userId,
        bookId: dto.bookId,
      },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this book');
    }

    return this.prisma.userBookReview.create({
      data: {
        userId,
        bookId: dto.bookId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async findAllByBook(bookId: string, currentUserId?: string) {
    const reviews = await this.prisma.userBookReview.findMany({
      where: { bookId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reviewVotes: {
          where: currentUserId ? { userId: currentUserId } : { userId: '' },
          select: { voteType: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => ({
      ...r,
      myVote: r.reviewVotes?.[0]?.voteType ?? null,
      reviewVotes: undefined,
    }));
  }

  async voteReview(
    userId: string,
    reviewId: string,
    voteType: 'UPVOTE' | 'DOWNVOTE',
  ) {
    const review = await this.prisma.userBookReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    const existingVote = await this.prisma.reviewVote.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off
        await this.prisma.reviewVote.delete({
          where: { userId_reviewId: { userId, reviewId } },
        });
        await this.prisma.userBookReview.update({
          where: { id: reviewId },
          data: {
            [voteType === 'UPVOTE' ? 'upvotes' : 'downvotes']: { decrement: 1 },
          },
        });
        return { message: 'Vote removed' };
      } else {
        // Switch vote
        const old = existingVote.voteType;
        await this.prisma.reviewVote.update({
          where: { userId_reviewId: { userId, reviewId } },
          data: { voteType },
        });
        await this.prisma.userBookReview.update({
          where: { id: reviewId },
          data: {
            [voteType === 'UPVOTE' ? 'upvotes' : 'downvotes']: { increment: 1 },
            [old === 'UPVOTE' ? 'upvotes' : 'downvotes']: { decrement: 1 },
          },
        });
        return { message: 'Vote changed' };
      }
    } else {
      await this.prisma.reviewVote.create({
        data: { userId, reviewId, voteType },
      });
      await this.prisma.userBookReview.update({
        where: { id: reviewId },
        data: {
          [voteType === 'UPVOTE' ? 'upvotes' : 'downvotes']: { increment: 1 },
        },
      });
      return { message: 'Vote added' };
    }
  }
}
