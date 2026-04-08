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
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async completeTransfer(purchaseId: string) {
    const purchase = await this.prisma.bookPurchase.findUnique({
      where: { id: purchaseId },
      include: { book: true },
    });

    if (!purchase || purchase.status !== 'PAID') {
      throw new BadRequestException('Transaction not found or already processed.');
    }

    const { sellerId, sellerAmount, price, book } = purchase;

    await this.prisma.$transaction(async (tx) => {
      // Mark purchase as COMPLETED
      await tx.bookPurchase.update({
        where: { id: purchaseId },
        data: { status: 'COMPLETED' },
      });

      // Transfer funds to seller wallet (using sellerAmount)
      await tx.user.update({
        where: { id: sellerId },
        data: { money: { increment: sellerAmount } },
      });
    });

    // Notify seller
    await this.notifications.create(
      sellerId,
      `Admin has released Rs. ${sellerAmount} for your sold book "${book.name}". Funds are now available in your wallet.`,
      'TRANSFER_COMPLETE',
    );

    return { ok: true, message: 'Transfer completed successfully' };
  }
}
