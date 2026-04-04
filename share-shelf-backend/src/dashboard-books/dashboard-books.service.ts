import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardBooksService {
  constructor(private prisma: PrismaService) { }

  async getGenres() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
    genre?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { author: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (dateFrom || dateTo) {
      where.releaseDate = {};
      if (dateFrom) where.releaseDate.gte = new Date(dateFrom);
      if (dateTo) where.releaseDate.lte = new Date(dateTo);
    }

    if (genre) {
      where.bookGenres = {
        some: {
          genre: { name: genre },
        },
      };
    }

    const [total, books] = await Promise.all([
      this.prisma.books.count({ where }),
      this.prisma.books.findMany({
        where,
        skip,
        take: limit,
        orderBy: { releaseDate: 'desc' },
        include: {
          bookGenres: {
            include: {
              genre: true,
            },
          },
          bookOffers: {
            where: { isActive: true },
            select: { price: true, type: true },
          },
        },
      }),
    ]);

    const formattedBooks = books.map((book) => {
      const { bookOffers, ...rest } = book as any;
      const sellOffers = bookOffers.filter((o: any) => o.type === 'SELL');
      const tradeOffers = bookOffers.filter((o: any) => o.type === 'TRADE');
      const lowestPrice =
        sellOffers.length > 0
          ? Math.min(...sellOffers.map((o: any) => o.price))
          : null;
      return {
        ...rest,
        lowestPrice,
        sellCount: sellOffers.length,
        tradeCount: tradeOffers.length,
      };
    });

    return {
      data: formattedBooks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.books.findUnique({
      where: { id },
      include: {
        bookGenres: {
          include: {
            genre: true,
          },
        },
      },
    });
  }

  async create(data: {
    name: string;
    author: string;
    description: string;
    image: string;
    price: number;
    releaseDate: string | Date;
    genres: string[];
    isPopular?: boolean;
    isFeatured?: boolean;
  }) {
    const { genres, ...bookData } = data;

    return this.prisma.books.create({
      data: {
        ...bookData,
        releaseDate: new Date(bookData.releaseDate),
        bookGenres: {
          create: genres.map((genreName) => ({
            genre: {
              connectOrCreate: {
                where: { name: genreName },
                create: { name: genreName },
              },
            },
          })),
        },
      },
      include: {
        bookGenres: {
          include: {
            genre: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      author?: string;
      description?: string;
      image?: string;
      price?: number;
      releaseDate?: string | Date;
      genres?: string[];
      isPopular?: boolean;
      isFeatured?: boolean;
    },
  ) {
    const { genres, ...bookData } = data;

    // Handle genres if provided
    if (genres) {
      // First, remove existing genres
      await this.prisma.bookGenre.deleteMany({
        where: { bookId: id },
      });

      // Then update book and add new genres
      return this.prisma.books.update({
        where: { id },
        data: {
          ...bookData,
          releaseDate: bookData.releaseDate ? new Date(bookData.releaseDate) : undefined,
          bookGenres: {
            create: genres.map((genreName) => ({
              genre: {
                connectOrCreate: {
                  where: { name: genreName },
                  create: { name: genreName },
                },
              },
            })),
          },
        },
        include: {
          bookGenres: {
            include: {
              genre: true,
            },
          },
        },
      });
    }

    return this.prisma.books.update({
      where: { id },
      data: {
        ...bookData,
        releaseDate: bookData.releaseDate ? new Date(bookData.releaseDate) : undefined,
      },
      include: {
        bookGenres: {
          include: {
            genre: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.books.delete({
      where: { id },
    });
  }
}
