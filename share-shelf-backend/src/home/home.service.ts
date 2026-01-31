import { Injectable } from '@nestjs/common';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  create(createHomeDto: CreateHomeDto) {
    return 'This action adds a new home';
  }

  async findAll() {
    return await this.prisma.books.findMany({
      select: {
        id: true,
        image: true,
        name: true,
        bookGenres: { select: { genre: { select: { name: true } } } },
      },
      take: 20,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} home`;
  }

  update(id: number, updateHomeDto: UpdateHomeDto) {
    return `This action updates a #${id} home`;
  }

  remove(id: number) {
    return `This action removes a #${id} home`;
  }
}
