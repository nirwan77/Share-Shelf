import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto';
import { BanAppealDto } from './dto/ban-appeal.dto';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from 'src/shared';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201 })
  async register(@Body() dto: RegisterDto) {
    const { email, password, name, phone, acceptTerms, acceptPrivacy } = dto;
    try {
      return await this.authService.register(
        email,
        password,
        name,
        phone,
        acceptTerms,
        acceptPrivacy,
      );
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

  @Post('forgot-password')
  @HttpCode(200)
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200 })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200 })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(
      dto.email,
      dto.code,
      dto.newPassword,
    );
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200 })
  async changePassword(
    @GetDashboardUserReqObject('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('verify-otp')
  @ApiQuery({ name: 'email', required: true, type: String })
  @ApiQuery({ name: 'code', required: true, type: String })
  @ApiResponse({ status: 200 })
  async verifyOtp(@Query('email') email: string, @Query('code') code: string) {
    return await this.authService.verifyOtp(email, code);
  }
}
