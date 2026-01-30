import { Injectable } from '@nestjs/common';
import { CreateExploreDto } from './dto/create-explore.dto';
import { UpdateExploreDto } from './dto/update-explore.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ExploreService {
  constructor(private prisma: PrismaService) {}

  create(createExploreDto: CreateExploreDto) {
    return 'This action adds a new explore';
  }

  async findAll({ skip = 0, limit = 20 }: { skip?: number; limit?: number }) {
    const data = await this.prisma.books.findMany({
      select: {
        id: true,
        author: true,
        bookGenres: { select: { genre: { select: { name: true } } } },
        name: true,
        image: true,
        price: true,
      },
      take: limit,
      skip,
    });

    const total = await this.prisma.books.count();

    return { data, total };
  }

  async findOne(id: string) {
    return await this.prisma.books.findUniqueOrThrow({
      where: { id },
      select: {
        author: true,
        description: true,
        bookGenres: { select: { genre: { select: { name: true } } } },
        name: true,
        image: true,
        price: true,
        userBookReviews: {
          select: {
            comment: true,
            user: { select: { name: true, avatar: true } },
          },
        },
        userBookStatuses: {
          select: {
            status: true,
          },
        },
      },
    });
  }

  update(id: number, updateExploreDto: UpdateExploreDto) {
    return `This action updates a #${id} explore`;
  }

  remove(id: number) {
    return `This action removes a #${id} explore`;
  }
}
