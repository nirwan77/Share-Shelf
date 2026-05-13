import {
  Injectable,
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
      where: { status: { in: ['PAID', 'BUYER_CONFIRMED'] } },
      include: {
        book: { select: { name: true, author: true, image: true, price: true } },
        buyer: { select: { name: true, email: true, phone: true } },
        seller: { select: { name: true, email: true, phone: true } },
        offer: { select: { sellerEsewaNumber: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAllTransactions() {
    return this.prisma.bookPurchase.findMany({
      include: {
        book: { select: { name: true, author: true, image: true, price: true } },
        buyer: { select: { name: true, email: true, phone: true } },
        seller: { select: { name: true, email: true, phone: true } },
        offer: { select: { sellerEsewaNumber: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getSummary() {
    const [completed, activePaid, successfulPurchases] = await Promise.all([
      this.prisma.bookPurchase.aggregate({
        where: { status: 'COMPLETED' },
        _sum: {
          commissionAmount: true,
          sellerAmount: true,
          price: true,
        },
        _count: { _all: true },
      }),
      this.prisma.bookPurchase.aggregate({
        where: { status: { in: ['PAID', 'BUYER_CONFIRMED'] } },
        _sum: {
          commissionAmount: true,
          sellerAmount: true,
          price: true,
        },
        _count: { _all: true },
      }),
      this.prisma.bookPurchase.aggregate({
        where: { status: { in: ['PAID', 'BUYER_CONFIRMED', 'COMPLETED'] } },
        _sum: {
          commissionAmount: true,
          sellerAmount: true,
          price: true,
        },
        _count: { _all: true },
      }),
    ]);

    return {
      totalSalesAmount: successfulPurchases._sum.price ?? 0,
      totalCommissionEarned: successfulPurchases._sum.commissionAmount ?? 0,
      completedCommission: completed._sum.commissionAmount ?? 0,
      pendingCommission: activePaid._sum.commissionAmount ?? 0,
      totalSellerPayoutSent: completed._sum.sellerAmount ?? 0,
      pendingSellerPayout: activePaid._sum.sellerAmount ?? 0,
      successfulPurchaseCount: successfulPurchases._count._all,
      completedPayoutCount: completed._count._all,
      pendingPayoutCount: activePaid._count._all,
    };
  }

  async completeTransfer(purchaseId: string) {
    const purchase = await this.prisma.bookPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        book: true,
        offer: { select: { sellerEsewaNumber: true } },
      },
    });

    if (
      !purchase ||
      !['PAID', 'BUYER_CONFIRMED'].includes(purchase.status)
    ) {
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

    return {
      ok: true,
      message: 'Transfer completed successfully',
      sellerAmount,
    };
  }

  async notifySeller(purchaseId: string) {
    const purchase = await this.prisma.bookPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        book: { select: { name: true } },
        buyer: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!purchase || purchase.status !== 'PAID') {
      throw new BadRequestException('Paid order not found or already processed.');
    }

    await this.notifications.create(
      purchase.sellerId,
      `Admin reminder: please prepare "${purchase.book.name}" for ${purchase.buyer.name}. Contact: ${purchase.buyer.phone || purchase.buyer.name}. Meeting/delivery location: ${purchase.location || 'Location not provided'}.`,
      'SELLER_DELIVERY_REQUEST',
    );

    return { ok: true, message: 'Seller notified successfully' };
  }
}
