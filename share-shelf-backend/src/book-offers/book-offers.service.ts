import {
  Injectable,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OfferType } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class BookOffersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(
    userId: string,
    data: {
      bookId: string;
      price: number;
      condition?: string;
      type: OfferType;
      note?: string;
      sellerLocation?: string;
      sellerEsewaNumber?: string;
    },
  ) {
    const sellerEsewaNumber = data.sellerEsewaNumber?.trim();
    const sellerLocation = data.sellerLocation?.trim();

    if (!sellerLocation) {
      throw new BadRequestException('Seller location is required');
    }

    if (data.type === 'SELL' && !sellerEsewaNumber) {
      throw new BadRequestException('eSewa number is required for sell offers');
    }

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

    const offer = await this.prisma.bookOffer.create({
      data: {
        ...data,
        sellerLocation,
        sellerEsewaNumber:
          data.type === 'SELL' ? sellerEsewaNumber : null,
        userId,
      },
      include: {
        book: { select: { id: true, name: true, image: true } },
      },
    });

    await this.notifyWishlistedUsers(offer.bookId, offer.userId, offer.book.name, offer.type);

    return offer;
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

  private async notifyWishlistedUsers(
    bookId: string,
    sellerId: string,
    bookName: string,
    offerType: OfferType,
  ) {
    const wishlistedUsers = await this.prisma.userBookStatus.findMany({
      where: {
        bookId,
        status: 'PLAN_TO_READ',
        userId: { not: sellerId },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    await Promise.all(
      wishlistedUsers.map((item) =>
        this.notifications.create(
          item.userId,
          `"${bookName}" from your wishlist is now available for ${offerType === 'SELL' ? 'buying' : 'trading'}.`,
          'WISHLIST_BOOK_AVAILABLE',
        ),
      ),
    );
  }
}
