import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const leaderboardCategories = [
  'exchanged',
  'reviews',
  'likes',
  'comments',
] as const;

export const leaderboardTimeRanges = ['all', 'month', 'year'] as const;

export type LeaderboardCategory = (typeof leaderboardCategories)[number];
export type LeaderboardTimeRange = (typeof leaderboardTimeRanges)[number];

export class LeaderboardQueryDto {
  @IsOptional()
  @IsIn(leaderboardCategories)
  category: LeaderboardCategory = 'exchanged';

  @IsOptional()
  @IsIn(leaderboardTimeRanges)
  timeRange: LeaderboardTimeRange = 'all';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}
