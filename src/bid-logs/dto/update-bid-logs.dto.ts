// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateBidLogsDto } from './create-bid-logs.dto';

export class UpdateBidLogsDto extends PartialType(CreateBidLogsDto) {}