import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetDashboardUserReqObject,
  JwtHeaderAuthGuard,
  JwtOptionalAuthGuard,
} from 'src/shared';
import { FeedQueryDto } from './dto/feed-query.dto';
import { DiscussService } from './discuss.service';

@ApiTags('discussions')
@Controller('discuss')
export class DiscussController {
  constructor(private readonly discussService: DiscussService) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Get the discussion feed with filtering and sorting' })
  async getFeed(
    @GetDashboardUserReqObject('id') userId: string,
    @Query() query: FeedQueryDto,
  ) {
    return this.discussService.getFeed(query, userId);
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Get a single post by ID' })
  async findOne(
    @Param('id') id: string,
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.discussService.findOne(id, userId);
  }

  @Get(':id/comments')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getComments(
    @Param('id') postId: string,
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.discussService.findComments(postId, userId);
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

  @Post(':id/react')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upvote or downvote a post (toggle)' })
  async togglePostReaction(
    @Param('id') postId: string,
    @GetDashboardUserReqObject('id') userId: string,
    @Body() body: { reaction: 'UPVOTE' | 'DOWNVOTE' },
  ) {
    return this.discussService.togglePostReaction(postId, userId, body.reaction);
  }

  @Post(':id/like')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Backward-compatible alias for post upvote toggle' })
  async togglePostLikeAlias(
    @Param('id') postId: string,
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.discussService.togglePostReaction(postId, userId, 'UPVOTE');
  }

  @Delete(':id')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a post by ID' })
  async deletePost(
    @Param('id') id: string,
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.discussService.deletePost(id, userId);
  }

  @Post(':id/update')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a post by ID' })
  async updatePost(
    @Param('id') id: string,
    @GetDashboardUserReqObject('id') userId: string,
    @Body() body: { title?: string; content?: string; image?: string },
  ) {
    return this.discussService.updatePost(id, userId, body);
  }

  @Post('comment/:id/react')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upvote or downvote a comment (toggle)' })
  async toggleCommentReaction(
    @Param('id') commentId: string,
    @GetDashboardUserReqObject('id') userId: string,
    @Body() body: { reaction: 'UPVOTE' | 'DOWNVOTE' },
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
