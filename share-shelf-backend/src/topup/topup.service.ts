import { Injectable } from '@nestjs/common';
import { UpdateTopupDto } from './dto/update-topup.dto';
import { PrismaService } from 'src/prisma.service';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class TopupService {
  constructor(private prisma: PrismaService) {}

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

    const fields = payload;
    const keys = signed_field_names.split(',');
    const message = keys.map((k) => `${k}=${fields[k]}`).join(',');

    const secret = '8gBm/:&EnhH.1/q';
    const hash = CryptoJS.HmacSHA256(message, secret);
    const generatedSignature = CryptoJS.enc.Base64.stringify(hash);

    if (generatedSignature !== signature) {
      throw new Error('Invalid signature');
    }

    if (status === 'COMPLETE') {
      const paymentRecord = await this.prisma.payment.create({
        data: {
          amount: Number(total_amount),
          product_code,
          transaction_uuid,
          tax_amount: 0,
          total_amount: Number(total_amount),
          status: 'SUCCESS',
        },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: { money: { increment: paymentRecord.total_amount } },
      });
    }

    return { ok: true };
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
}
