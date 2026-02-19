import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { DiscussService } from './discuss.service';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from 'src/shared';

@ApiTags('discussions')
@Controller('discuss')
export class DiscussController {
  constructor(private readonly discussService: DiscussService) {}

  @Get()
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    enum: ['popular', 'recent'],
    description: 'Sort by popularity or creation date',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  async findAll(
    @GetDashboardUserReqObject('id') userId: string,
    @Query('sortBy') sortBy?: 'popular' | 'recent',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.discussService.findAll(
      sortBy || 'recent',
      sortOrder || 'desc',
      userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single post by ID' })
  async findOne(@Param('id') id: string) {
    return this.discussService.findOne(id);
  }

  @Post()
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new post' })
  async createPost(
    @Body() body: { content?: string; image?: string; title: string },
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.discussService.createPost({ ...body, createdById: userId });
  }

  @Post(':id/comment')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a comment to a post' })
  async addComment(
    @Param('id') postId: string,
    @Body() body: { comment: string; parentCommentId?: string },
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.discussService.addComment(
      postId,
      userId,
      body.comment,
      body.parentCommentId,
    );
  }

  @Post(':id/like')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'React / like a post (toggle)' })
  async togglePostReaction(
    @Param('id') postId: string,
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.discussService.togglePostReaction(postId, userId);
  }

  @Delete(':id')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a post by ID' })
  async deletePost(@Param('id') id: string) {
    return this.discussService.deletePost(id);
  }

  @Post('comment/:id/react')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Like or dislike a comment (toggle reaction)' })
  async toggleCommentReaction(
    @Param('id') commentId: string,
    @GetDashboardUserReqObject('id') userId: string,
    @Body() body: { reaction: string },
  ) {
    return this.discussService.toggleCommentReaction(
      commentId,
      userId,
      body.reaction,
    );
  }

  @Delete('comment/:id')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a comment by ID' })
  async deleteComment(@Param('id') commentId: string) {
    return this.discussService.deleteComment(commentId);
  }
}
