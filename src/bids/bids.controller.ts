import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Bid } from './domain/bid';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllBidsDto } from './dto/find-all-bids.dto';

@ApiTags('Bids')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'bids',
  version: '1',
})
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Bid,
  })
  create(@Body() createBidDto: CreateBidDto) {
    return this.bidsService.create(createBidDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Bid),
  })
  async findAll(
    @Query() query: FindAllBidsDto,
  ): Promise<InfinityPaginationResponseDto<Bid>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.bidsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Bid,
  })
  findById(@Param('id') id: string) {
    return this.bidsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Bid,
  })
  update(@Param('id') id: string, @Body() updateBidDto: UpdateBidDto) {
    return this.bidsService.update(id, updateBidDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.bidsService.remove(id);
  }
}
