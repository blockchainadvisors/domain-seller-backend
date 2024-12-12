// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateOffersDto } from './create-offers.dto';

export class UpdateOffersDto extends PartialType(CreateOffersDto) {
  status: string | undefined;
}
