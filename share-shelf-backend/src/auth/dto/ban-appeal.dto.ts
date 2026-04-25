import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class BanAppealDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  message: string;
}
