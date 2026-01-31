import { Injectable } from '@nestjs/common';
import { CreateExploreDto } from './dto/create-explore.dto';
import { UpdateExploreDto } from './dto/update-explore.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExploreService {
  constructor(private prisma: PrismaService) {}

  create(createExploreDto: CreateExploreDto) {
    return 'This action adds a new explore';
  }

  async findAll(
    filters: {
      skip?: number;
      limit?: number;
      minPrice?: number;
      maxPrice?: number;
      categories?: string[];
      publishedDate?: string;
    } = {},
  ) {
    const {
      skip = 0,
      limit = 20,
      minPrice,
      maxPrice,
      categories,
      publishedDate,
    } = filters;

    const where: Prisma.BooksWhereInput = {};

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Category filter - FIXED ✅
    if (categories && categories.length > 0) {
      where.bookGenres = {
        some: {
          genre: {
            name: {
              in: categories,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    // Published date filter
    if (publishedDate) {
      const yearRanges = {
        'before-1990': { lte: new Date('1989-12-31') },
        '1990-2000': {
          gte: new Date('1990-01-01'),
          lte: new Date('2000-12-31'),
        },
        '2000-2005': {
          gte: new Date('2000-01-01'),
          lte: new Date('2005-12-31'),
        },
        '2005-2010': {
          gte: new Date('2005-01-01'),
          lte: new Date('2010-12-31'),
        },
        '2010-2015': {
          gte: new Date('2010-01-01'),
          lte: new Date('2015-12-31'),
        },
        '2015-present': { gte: new Date('2015-01-01') },
      };

      if (publishedDate in yearRanges) {
        where.releaseDate =
          yearRanges[publishedDate as keyof typeof yearRanges];
      }
    }

    const data = await this.prisma.books.findMany({
      where,
      select: {
        id: true,
        author: true,
        bookGenres: { select: { genre: { select: { name: true } } } },
        name: true,
        image: true,
        price: true,
        releaseDate: true,
      },
      take: limit,
      skip,
      orderBy: { releaseDate: 'desc' },
    });

    const total = await this.prisma.books.count({ where });

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
