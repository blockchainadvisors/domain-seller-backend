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
import { BidLogsService } from './bid-logs.service';
import { CreateBidLogsDto } from './dto/create-bid-logs.dto';
import { UpdateBidLogsDto } from './dto/update-bid-logs.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { BidLogs } from './domain/bid-logs';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllBidLogsDto } from './dto/find-all-bid-logs.dto';

@ApiTags('Bidlogs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'bid-logs',
  version: '1',
})
export class BidLogsController {
  constructor(private readonly bidLogsService: BidLogsService) {}

  @Post()
  @ApiCreatedResponse({
    type: BidLogs,
  })
  create(@Body() createBidLogsDto: CreateBidLogsDto) {
    return this.bidLogsService.create(createBidLogsDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(BidLogs),
  })
  async findAll(
    @Query() query: FindAllBidLogsDto,
  ): Promise<InfinityPaginationResponseDto<BidLogs>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.bidLogsService.findAllWithPagination({
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
    type: BidLogs,
  })
  findById(@Param('id') id: string) {
    return this.bidLogsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: BidLogs,
  })
  update(@Param('id') id: string, @Body() updateBidLogsDto: UpdateBidLogsDto) {
    return this.bidLogsService.update(id, updateBidLogsDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.bidLogsService.remove(id);
  }
}
