import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TopupService } from './topup.service';
import { CreateTopupDto } from './dto/create-topup.dto';
import { UpdateTopupDto } from './dto/update-topup.dto';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from 'src/shared';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('topup')
export class TopupController {
  constructor(private readonly topupService: TopupService) {}

  @Post()
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async verifyPayment(
    @GetDashboardUserReqObject('id') userId: string,
    @Body() payload: any,
  ) {
    return this.topupService.verifyPayment(userId, payload);
  }

  @Get()
  findAll() {
    return this.topupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTopupDto: UpdateTopupDto) {
    return this.topupService.update(+id, updateTopupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.topupService.remove(+id);
  }
}
