import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateTopupDto } from './dto/update-topup.dto';
import { PrismaService } from 'src/prisma.service';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class TopupService {
  constructor(private prisma: PrismaService) {}

  createEsewaSignature(totalAmount: string, transactionUuid: string) {
    if (!transactionUuid || !Number.isFinite(Number(totalAmount)) || Number(totalAmount) <= 0) {
      throw new BadRequestException('Invalid eSewa payment signature request');
    }

    const { productCode, gatewayUrl } = this.getEsewaConfig();
    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const fields = {
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
    };

    return {
      product_code: productCode,
      gateway_url: gatewayUrl,
      signed_field_names: signedFieldNames,
      signature: this.generateSignature(fields, signedFieldNames),
    };
  }

  async verifyPayment(userId: string, payload: any) {
    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature,
    } = payload;

    const doesDataExist = await this.prisma.payment.count({
      where: {
        transaction_uuid,
      },
    });

    if (doesDataExist) {
      return 'already verified';
    }

    if (!signed_field_names || !signature) {
      throw new BadRequestException('Missing eSewa signature fields');
    }

    const { productCode } = this.getEsewaConfig();

    if (product_code !== productCode) {
      throw new BadRequestException('Invalid eSewa product code');
    }

    const generatedSignature = this.generateSignature(payload, signed_field_names);

    if (generatedSignature !== signature) {
      throw new BadRequestException('Invalid signature');
    }

    // Store payment record with user association
    const paymentStatus = status === 'COMPLETE' ? 'SUCCESS' : 'FAILED';
    const paymentRecord = await this.prisma.payment.create({
      data: {
        amount: Number(total_amount),
        product_code,
        transaction_uuid,
        tax_amount: 0,
        total_amount: Number(total_amount),
        status: paymentStatus,
        userId: userId,
        signature: signature,
      },
    });

    // Only update user balance for successful payments
    if (status === 'COMPLETE') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { money: { increment: paymentRecord.total_amount } },
      });
    }

    return { ok: true, status: paymentStatus, paymentId: paymentRecord.id };
  }

  async getAllTransactions() {
    return this.prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findAll() {
    return `This action returns all topup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} topup`;
  }

  update(id: number, updateTopupDto: UpdateTopupDto) {
    return `This action updates a #${id} topup`;
  }

  remove(id: number) {
    return `This action removes a #${id} topup`;
  }

  private getEsewaConfig() {
    const secret = process.env.ESEWA_SECRET_KEY;
    const productCode = process.env.ESEWA_PRODUCT_CODE;
    const gatewayUrl = process.env.ESEWA_GATEWAY_URL;

    if (!secret || !productCode || !gatewayUrl) {
      throw new BadRequestException('eSewa environment variables are not configured');
    }

    return { secret, productCode, gatewayUrl };
  }

  private generateSignature(fields: Record<string, any>, signedFieldNames: string) {
    const { secret } = this.getEsewaConfig();
    const keys = signedFieldNames.split(',');
    const message = keys.map((k) => `${k}=${fields[k]}`).join(',');
    const hash = CryptoJS.HmacSHA256(message, secret);

    return CryptoJS.enc.Base64.stringify(hash);
  }
}
