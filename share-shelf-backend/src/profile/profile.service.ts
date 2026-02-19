import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        avatar: true,
        money: true,
        email: true,
        isVerified: true,
        name: true,
      },
    });
  }
}
