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
  ParseFloatPipe,
  ParseArrayPipe,
  ParseEnumPipe,
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
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    example: 0,
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    example: 3000,
    type: Number,
  })
  @ApiQuery({
    name: 'categories',
    required: false,
    description: 'Comma-separated categories (fiction,non-fiction)',
    example: 'fiction,history',
  })
  @ApiQuery({
    name: 'publishedDate',
    required: false,
    description: 'Release date range (before-1990,1990-2000,etc.)',
    enum: [
      'before-1990',
      '1990-2000',
      '2000-2005',
      '2005-2010',
      '2010-2015',
      '2015-present',
    ],
    example: '2015-present',
  })
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number,
    @Query('minPrice', new ParseFloatPipe({ optional: true }))
    minPrice?: number,
    @Query('maxPrice', new ParseFloatPipe({ optional: true }))
    maxPrice?: number,
    @Query('categories', new ParseArrayPipe({ optional: true, separator: ',' }))
    categories?: string[],
    @Query(
      'publishedDate',
      new ParseEnumPipe(
        [
          'before-1990',
          '1990-2000',
          '2000-2005',
          '2005-2010',
          '2010-2015',
          '2015-present',
        ],
        { optional: true },
      ),
    )
    publishedDate?: string,
  ) {
    return this.exploreService.findAll({
      limit,
      skip,
      minPrice,
      maxPrice,
      categories,
      publishedDate,
    });
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
