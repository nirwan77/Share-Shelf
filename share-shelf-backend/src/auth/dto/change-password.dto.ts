import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldstrongpassword' })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newstrongpassword' })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
