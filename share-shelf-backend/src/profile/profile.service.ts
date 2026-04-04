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
        id: true,
        avatar: true,
        money: true,
        email: true,
        isVerified: true,
        name: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        userBookStatuses: {
          select: {
            status: true,
            book: {
              select: {
                id: true,
                name: true,
                author: true,
                image: true,
              },
            },
          },
        },
        userBookReviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            book: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }

  async findOnePublic(id: string, currentUserId?: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        avatar: true,
        name: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        followers: currentUserId
          ? {
              where: { followerId: currentUserId },
              select: { id: true },
            }
          : false,
        userBookStatuses: {
          select: {
            status: true,
            book: {
              select: {
                id: true,
                name: true,
                author: true,
                image: true,
              },
            },
          },
        },
        userBookReviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            book: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return {
      ...user,
      isFollowing: currentUserId ? (user.followers as any[]).length > 0 : false,
      followers: undefined,
    };
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('You cannot follow yourself');
    }
    return this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async unfollow(followerId: string, followingId: string) {
    return this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async getFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }

  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });
  }
}
