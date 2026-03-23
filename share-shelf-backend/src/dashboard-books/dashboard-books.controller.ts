import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardBooksService } from './dashboard-books.service';
import { DashboardAuthGuard } from '../shared/dashboardGuard';

@ApiTags('dashboard-books')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard-books')
@UseGuards(DashboardAuthGuard)
export class DashboardBooksController {
  constructor(private readonly dashboardBooksService: DashboardBooksService) {}

  @Get('genres')
  @ApiOperation({ summary: 'List all available genres' })
  async getGenres() {
    return this.dashboardBooksService.getGenres();
  }

  @Get()
  @ApiOperation({ summary: 'List all books with pagination, search, and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'genre', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('genre') genre?: string,
  ) {
    return this.dashboardBooksService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      dateFrom,
      dateTo,
      genre,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details for a specific book' })
  async findOne(@Param('id') id: string) {
    return this.dashboardBooksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new book' })
  async create(@Body() createBookDto: any) {
    return this.dashboardBooksService.create(createBookDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book' })
  async update(@Param('id') id: string, @Body() updateBookDto: any) {
    return this.dashboardBooksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book' })
  async remove(@Param('id') id: string) {
    return this.dashboardBooksService.remove(id);
  }
}
