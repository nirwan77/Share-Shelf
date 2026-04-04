import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateBookReviewDto {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
