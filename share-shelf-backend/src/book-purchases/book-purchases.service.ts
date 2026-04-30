import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class BookPurchasesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async initiatePurchase(buyerId: string, offerId: string, location?: string) {
    const offer = await this.prisma.bookOffer.findUnique({
      where: { id: offerId },
      include: { book: true },
    });

    if (!offer || !offer.isActive) {
      throw new NotFoundException('Offer not found or inactive');
    }

    if (offer.userId === buyerId) {
      throw new BadRequestException('You cannot buy your own offer');
    }

    const existingPending = await this.prisma.bookPurchase.findFirst({
      where: {
        offerId,
        buyerId,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      // Update location if provided
      if (location && existingPending.location !== location) {
        await this.prisma.bookPurchase.update({
          where: { id: existingPending.id },
          data: { location },
        });
      }
      return {
        purchaseId: existingPending.id,
        price: existingPending.price,
        bookName: offer.book.name,
      };
    }

    const purchase = await this.prisma.bookPurchase.create({
      data: {
        buyerId,
        sellerId: offer.userId,
        offerId,
        bookId: offer.bookId,
        price: offer.price,
        status: 'PENDING',
        location,
      },
    });

    return {
      purchaseId: purchase.id,
      price: purchase.price,
      bookName: offer.book.name,
    };
  }

  async completePurchase(purchaseId: string, userId: string, payload: any) {
    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature,
    } = payload;

    const purchase = await this.prisma.bookPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        book: true,
        offer: true,
        buyer: { select: { name: true, phone: true } },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase record not found');
    }

    if (purchase.status !== 'PENDING') {
      return { message: 'Purchase already processed', status: purchase.status };
    }

    if (!signed_field_names || !signature) {
      throw new BadRequestException('Missing eSewa signature fields');
    }

    const expectedAmount = Number(purchase.price).toFixed(2);

    if (Number(total_amount).toFixed(2) !== expectedAmount) {
      throw new BadRequestException('Payment amount does not match purchase price');
    }

    const { productCode } = this.getEsewaConfig();

    if (product_code !== productCode) {
      throw new BadRequestException('Invalid eSewa product code');
    }

    const generatedSignature = this.generateEsewaSignature(
      payload,
      signed_field_names,
    );

    if (generatedSignature !== signature) {
      console.error('[BookPurchasesService] Signature verification failed!', {
        generatedSignature,
        signature,
        payload
      });
      throw new BadRequestException('Invalid payment signature');
    }

    if (status === 'COMPLETE') {
      // Calculate commission (10%)
      const commissionAmount = Math.round(purchase.price * 0.1);
      const sellerAmount = purchase.price - commissionAmount;

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create a Payment record for the admin to see
        await tx.payment.create({
          data: {
            transaction_uuid,
            product_code,
            amount: purchase.price,
            tax_amount: 0,
            total_amount: Number(total_amount),
            status: 'SUCCESS',
            userId: userId,
            signature: signature,
          },
        });

        // 2. Mark purchase as PAID (Escrow stage)
        const updatedPurchase = await tx.bookPurchase.update({
          where: { id: purchaseId },
          data: {
            status: 'PAID',
            transactionUuid: transaction_uuid,
            commissionAmount,
            sellerAmount,
          },
        });

        // 3. Deactivate the offer
        await tx.bookOffer.update({
          where: { id: purchase.offerId },
          data: { isActive: false },
        });

        return updatedPurchase;
      });

      // Send notifications
      await this.notifications.create(
        userId,
        `Successfully purchased "${purchase.book.name}" for Rs. ${purchase.price}. Your order is awaiting admin processing.`,
        'PURCHASE_SUCCESS',
      );

      await this.notifications.create(
        purchase.sellerId,
        `Someone has bought your book "${purchase.book.name}". Buyer: ${purchase.buyer.name}. Contact: ${purchase.buyer.phone || purchase.buyer.name}. Meeting/delivery location: ${purchase.location || 'Location not provided'}. Please prepare the book and coordinate with the buyer. Admin will send Rs. ${sellerAmount} (after 10% commission) to your eSewa number after verification.`,
        'BOOK_SOLD',
      );

      return {
        ok: true,
        message: 'Book purchased successfully',
        purchaseId: result.id,
      };
    }

    return { ok: false, message: 'Payment not completed' };
  }

  async getMyPurchases(userId: string) {
    const purchases = await this.prisma.bookPurchase.findMany({
      where: { buyerId: userId },
      include: {
        book: { select: { id: true, name: true, image: true, author: true } },
        seller: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sellerIds = [...new Set(purchases.map((purchase) => purchase.sellerId))];
    const ratings = await this.prisma.userRating.findMany({
      where: {
        ratingUserId: userId,
        ratedUserId: { in: sellerIds },
      },
      select: { ratedUserId: true, rating: true },
    });
    const sellerRatings = new Map(
      ratings.map((rating) => [rating.ratedUserId, rating.rating]),
    );

    return purchases.map((purchase) => ({
      ...purchase,
      sellerThanked: sellerRatings.has(purchase.sellerId),
      sellerRating: sellerRatings.get(purchase.sellerId) ?? null,
    }));
  }

  async confirmReceived(userId: string, purchaseId: string) {
    const purchase = await this.prisma.bookPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        book: { select: { name: true } },
        buyer: { select: { name: true } },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase record not found');
    }

    if (purchase.buyerId !== userId) {
      throw new ForbiddenException('You can only confirm your own purchase');
    }

    if (purchase.status === 'BUYER_CONFIRMED') {
      return { ok: true, message: 'Receipt already confirmed' };
    }

    if (purchase.status !== 'PAID') {
      throw new BadRequestException('Only paid purchases can be confirmed');
    }

    const updatedPurchase = await this.prisma.bookPurchase.update({
      where: { id: purchaseId },
      data: { status: 'BUYER_CONFIRMED' },
    });

    await this.notifications.create(
      purchase.sellerId,
      `${purchase.buyer.name} confirmed receiving "${purchase.book.name}". Admin can now review and process your payout.`,
      'BUYER_CONFIRMED_RECEIPT',
    );

    return {
      ok: true,
      message: 'Receipt confirmed. Admin can now process seller payout.',
      purchaseId: updatedPurchase.id,
    };
  }

  async thankSeller(userId: string, purchaseId: string, rating = 5) {
    const normalizedRating = Number(rating);

    if (
      !Number.isInteger(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      throw new BadRequestException('Seller rating must be a whole number from 1 to 5');
    }

    const purchase = await this.prisma.bookPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        book: { select: { name: true } },
        buyer: { select: { name: true } },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase record not found');
    }

    if (purchase.buyerId !== userId) {
      throw new ForbiddenException('You can only rate sellers from your own purchases');
    }

    if (!['BUYER_CONFIRMED', 'COMPLETED'].includes(purchase.status)) {
      throw new BadRequestException('Confirm receipt before rating the seller');
    }

    const existingRating = await this.prisma.userRating.findFirst({
      where: {
        ratingUserId: userId,
        ratedUserId: purchase.sellerId,
      },
    });

    if (existingRating) {
      await this.prisma.userRating.update({
        where: { id: existingRating.id },
        data: { rating: normalizedRating },
      });

      return { ok: true, message: 'Seller rating updated successfully' };
    }

    await this.prisma.userRating.create({
      data: {
        rating: normalizedRating,
        ratingUserId: userId,
        ratedUserId: purchase.sellerId,
      },
    });

    await this.notifications.create(
      purchase.sellerId,
      `${purchase.buyer.name} rated you ${normalizedRating} out of 5 for the transaction on "${purchase.book.name}".`,
      'SELLER_THANKED',
    );

    return { ok: true, message: 'Seller rated successfully' };
  }

  private getEsewaConfig() {
    const secret = process.env.ESEWA_SECRET_KEY;
    const productCode = process.env.ESEWA_PRODUCT_CODE;

    if (!secret || !productCode) {
      throw new BadRequestException('eSewa environment variables are not configured');
    }

    return { secret, productCode };
  }

  private generateEsewaSignature(
    fields: Record<string, any>,
    signedFieldNames: string,
  ) {
    const { secret } = this.getEsewaConfig();
    const keys = signedFieldNames.split(',');
    const message = keys.map((k) => `${k}=${fields[k]}`).join(',');
    const hash = CryptoJS.HmacSHA256(message, secret);

    return CryptoJS.enc.Base64.stringify(hash);
  }
}
