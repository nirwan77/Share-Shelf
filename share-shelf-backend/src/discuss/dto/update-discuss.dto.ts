import { PartialType } from '@nestjs/swagger';
import { CreateDiscussDto } from './create-discuss.dto';

export class UpdateDiscussDto extends PartialType(CreateDiscussDto) {}
