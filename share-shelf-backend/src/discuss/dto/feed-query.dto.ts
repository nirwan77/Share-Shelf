import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum FeedFilter {
  MY_POSTS = 'my_posts',
  FOLLOWING = 'following',
}

export enum FeedTimeRange {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  ALL_TIME = 'all_time',
}

export enum FeedSortBy {
  LATEST = 'latest',
  TRENDING = 'trending',
  MOST_POPULAR = 'most_popular',
  MOST_COMMENTED = 'most_commented',
  MOST_LIKED = 'most_liked',
}

export class FeedQueryDto {
  @ApiPropertyOptional({ enum: FeedFilter, description: 'Filter posts by specific criteria' })
  @IsOptional()
  @IsEnum(FeedFilter)
  filter?: FeedFilter;

  @ApiPropertyOptional({ enum: FeedTimeRange, description: 'Time range for filtering posts' })
  @IsOptional()
  @IsEnum(FeedTimeRange)
  timeRange?: FeedTimeRange;

  @ApiPropertyOptional({ enum: FeedSortBy, description: 'Property to sort posts by' })
  @IsOptional()
  @IsEnum(FeedSortBy)
  sortBy?: FeedSortBy;

  @ApiPropertyOptional({ description: 'The page number', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'The number of posts per page', default: 10 })
  @IsOptional()
  limit?: number = 10;
}
