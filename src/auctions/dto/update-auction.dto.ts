// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateAuctionDto } from './create-auction.dto';

export class UpdateAuctionDto extends PartialType(CreateAuctionDto) {}
