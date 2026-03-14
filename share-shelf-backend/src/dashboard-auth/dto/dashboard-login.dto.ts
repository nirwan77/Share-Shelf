import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class DashboardLoginDto {
  @ApiProperty({ example: 'admin@shareshelf.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword' })
  @IsNotEmpty()
  password: string;
}
