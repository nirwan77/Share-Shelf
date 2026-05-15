import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class DashboardPurchasesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getPendingTransactions() {
    return this.prisma.bookPurchase.findMany({
      where: { status: 'PAID' },
      include: {
        book: { select: { name: true, author: true, image: true, price: true } },
        buyer: { select: { name: true, email: true } },
        seller: { select: { name: true, email: true } },
        offer: { select: { sellerEsewaNumber: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async completeTransfer(purchaseId: string) {
    const purchase = await this.prisma.bookPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        book: true,
        offer: { select: { sellerEsewaNumber: true } },
      },
    });

    if (!purchase || purchase.status !== 'PAID') {
      throw new BadRequestException('Transaction not found or already processed.');
    }

    const { sellerId, sellerAmount, book, offer } = purchase;

    if (!offer.sellerEsewaNumber) {
      throw new BadRequestException('Seller eSewa number is missing.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.bookPurchase.update({
        where: { id: purchaseId },
        data: { status: 'COMPLETED' },
      });
    });

    await this.notifications.create(
      sellerId,
      `Admin has processed Rs. ${sellerAmount} for your sold book "${book.name}" to your eSewa number ${offer.sellerEsewaNumber}.`,
      'TRANSFER_COMPLETE',
    );

    return { ok: true, message: 'Transfer completed successfully' };
  }
}
