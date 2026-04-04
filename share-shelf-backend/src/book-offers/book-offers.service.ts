import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OfferType } from '@prisma/client';

@Injectable()
export class BookOffersService {
  constructor(private prisma: PrismaService) { }

  async create(
    userId: string,
    data: {
      bookId: string;
      price: number;
      condition?: string;
      type: OfferType;
      note?: string;
    },
  ) {
    const existingOffer = await this.prisma.bookOffer.findFirst({
      where: {
        userId,
        bookId: data.bookId,
        isActive: true,
      },
    });

    if (existingOffer) {
      throw new ConflictException('You already have an active offer for this book');
    }

    return this.prisma.bookOffer.create({
      data: {
        ...data,
        userId,
      },
      include: {
        book: { select: { id: true, name: true, image: true } },
      },
    });
  }

  async findByBook(bookId: string) {
    return this.prisma.bookOffer.findMany({
      where: { bookId, isActive: true },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { price: 'asc' },
    });
  }

  async findMyOffers(userId: string) {
    return this.prisma.bookOffer.findMany({
      where: { userId },
      include: {
        book: {
          select: { id: true, name: true, image: true, author: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const offer = await this.prisma.bookOffer.findUniqueOrThrow({
      where: { id },
    });

    if (offer.userId !== userId) {
      throw new ForbiddenException('You can only delete your own offers');
    }

    return this.prisma.bookOffer.delete({ where: { id } });
  }
}
