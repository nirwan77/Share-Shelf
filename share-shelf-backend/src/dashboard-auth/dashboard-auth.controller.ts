import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { DashboardAuthService } from './dashboard-auth.service';
import { DashboardLoginDto } from './dto';

@ApiTags('dashboard-auth')
@Controller('dashboard-auth')
export class DashboardAuthController {
  constructor(private readonly dashboardAuthService: DashboardAuthService) {}

  @Post('login')
  @ApiBody({ type: DashboardLoginDto })
  @ApiResponse({ status: 200 })
  async login(@Body() dto: DashboardLoginDto) {
    const { email, password } = dto;
    return await this.dashboardAuthService.login(email, password);
  }
}
