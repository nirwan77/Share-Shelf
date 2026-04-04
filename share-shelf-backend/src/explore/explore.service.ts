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
      sortBy?: string;
      search?: string;
    } = {},
  ) {
    const {
      skip = 0,
      limit = 20,
      minPrice,
      maxPrice,
      categories,
      publishedDate,
      sortBy,
      search,
    } = filters;

    const where: Prisma.BooksWhereInput = {
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (categories && categories.length > 0) {
      where.AND = categories.map((category) => ({
        bookGenres: {
          some: {
            genre: {
              name: {
                equals: category,
                mode: 'insensitive',
              },
            },
          },
        },
      }));
    }

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

    const books = await this.prisma.books.findMany({
      where,
      select: {
        id: true,
        author: true,
        bookGenres: { select: { genre: { select: { name: true } } } },
        name: true,
        image: true,
        price: true,
        releaseDate: true,
        bookOffers: {
          where: { isActive: true },
          select: { price: true, type: true },
        },
      },
      take: limit,
      skip,
      orderBy: { releaseDate: 'desc' },
    });

    const data = books.map((book) => {
      const { bookOffers, ...rest } = book;
      const sellOffers = bookOffers.filter((o) => o.type === 'SELL');
      const tradeOffers = bookOffers.filter((o) => o.type === 'TRADE');
      const lowestPrice =
        sellOffers.length > 0
          ? Math.min(...sellOffers.map((o) => o.price))
          : null;
      return {
        ...rest,
        lowestPrice,
        sellCount: sellOffers.length,
        tradeCount: tradeOffers.length,
      };
    });

    // Sort by lowest offer price if requested
    if (sortBy === 'price') {
      data.sort((a, b) => {
        if (a.lowestPrice === null && b.lowestPrice === null) return 0;
        if (a.lowestPrice === null) return 1;
        if (b.lowestPrice === null) return -1;
        return a.lowestPrice - b.lowestPrice;
      });
    }

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
            id: true,
            comment: true,
            rating: true,
            upvotes: true,
            downvotes: true,
            createdAt: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        userBookStatuses: {
          select: {
            status: true,
            userId: true,
          },
        },
        bookOffers: {
          where: { isActive: true },
          select: {
            id: true,
            price: true,
            condition: true,
            type: true,
            note: true,
            createdAt: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { price: 'asc' },
        },
        _count: { select: { userBookReviews: true } },
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
