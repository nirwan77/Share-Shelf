import { Injectable, ConflictException } from '@nestjs/common';
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

  async findAllByBook(bookId: string) {
    return this.prisma.userBookReview.findMany({
      where: { bookId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
