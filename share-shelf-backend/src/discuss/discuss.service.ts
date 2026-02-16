import { Injectable } from '@nestjs/common';
import { CreateDiscussDto } from './dto/create-discuss.dto';
import { UpdateDiscussDto } from './dto/update-discuss.dto';

@Injectable()
export class DiscussService {
  create(createDiscussDto: CreateDiscussDto) {
    return 'This action adds a new discuss';
  }

  findAll() {
    return `This action returns all discuss`;
  }

  findOne(id: number) {
    return `This action returns a #${id} discuss`;
  }

  update(id: number, updateDiscussDto: UpdateDiscussDto) {
    return `This action updates a #${id} discuss`;
  }

  remove(id: number) {
    return `This action removes a #${id} discuss`;
  }
}
