import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9800000000' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  acceptTerms: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  acceptPrivacy: boolean;
}
