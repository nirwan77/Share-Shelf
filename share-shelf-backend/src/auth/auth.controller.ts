import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { BanAppealDto } from './dto/ban-appeal.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201 })
  async register(@Body() dto: RegisterDto) {
    const { email, password, name, phone } = dto;
    try {
      return await this.authService.register(email, password, name, phone);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200 })
  async login(@Body() dto: LoginDto) {
    const { email, password } = dto;
    return await this.authService.login(email, password);
  }

  @Post('ban-appeal')
  @ApiBody({ type: BanAppealDto })
  @ApiResponse({ status: 201 })
  async submitBanAppeal(@Body() dto: BanAppealDto) {
    return await this.authService.submitBanAppeal(dto.email, dto.message);
  }

  @Post('verify-otp')
  @ApiQuery({ name: 'email', required: true, type: String })
  @ApiQuery({ name: 'code', required: true, type: String })
  @ApiResponse({ status: 200 })
  async verifyOtp(@Query('email') email: string, @Query('code') code: string) {
    return await this.authService.verifyOtp(email, code);
  }
}
