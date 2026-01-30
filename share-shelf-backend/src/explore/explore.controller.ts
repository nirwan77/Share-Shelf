import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ExploreService } from './explore.service';
import { CreateExploreDto } from './dto/create-explore.dto';
import { UpdateExploreDto } from './dto/update-explore.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Post()
  create(@Body() createExploreDto: CreateExploreDto) {
    return this.exploreService.create(createExploreDto);
  }
  @Get()
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of items to skip',
    example: 0,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items to retrieve (max: 100)',
    example: 20,
  })
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit,
    @Query('skip', new ParseIntPipe({ optional: true })) skip,
  ) {
    return this.exploreService.findAll({ limit, skip });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exploreService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExploreDto: UpdateExploreDto) {
    return this.exploreService.update(+id, updateExploreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exploreService.remove(+id);
  }
}
