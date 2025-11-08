import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const doesUserExist = await this.prisma.user.findUnique({
      where: { email },
    });

    if (doesUserExist) {
      throw new Error('User with this email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hashed, name },
    });
    return this.generateToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id, user.email);
  }

  private generateToken(userId: string, email: string) {
    return {
      access_token: this.jwtService.sign(
        { sub: userId, email },
        { secret: process.env.JWT_SECRET || 'supersecretkey', expiresIn: '1d' },
      ),
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'supersecretkey',
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
