import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter: Transporter;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async register(email: string, password: string, name: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('User already exists');

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hashed, name, isVerified: false },
    });

    await this.sendOtp(email);
    return { message: 'OTP sent to email', userId: user.id };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isVerified) throw new UnauthorizedException('Email not verified');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id, user.email);
  }

  async sendOtp(email: string) {
    const otp = this.generateOtp();

    await this.prisma.otp.create({
      data: {
        email,
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await this.transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'OTP Verification',
      html: `<h2>${otp}</h2>`,
    });

    return { message: 'OTP sent' };
  }

  async verifyOtp(email: string, code: string) {
    const record = await this.prisma.otp.findFirst({ where: { email, code } });
    if (!record) throw new UnauthorizedException('Invalid OTP');
    if (record.expiresAt < new Date())
      throw new UnauthorizedException('OTP expired');

    await this.prisma.otp.delete({ where: { id: record.id } });

    const user = await this.prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    return this.generateToken(user.id, user.email);
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateToken(userId: string, email: string) {
    return {
      access_token: this.jwtService.sign(
        { sub: userId, email },
        { secret: process.env.JWT_SECRET || 'secret', expiresIn: '1d' },
      ),
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
