import { PartialType } from '@nestjs/swagger';
import { CreateTopupDto } from './create-topup.dto';

export class UpdateTopupDto extends PartialType(CreateTopupDto) {}
