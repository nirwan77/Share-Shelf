import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'newstrongpassword' })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
