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
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Request } from '@nestjs/common';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { Payment } from '../payments/domain/payment';

@ApiTags('Bids')
@Controller({
  path: 'bids',
  version: '1',
})
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({
    type: Bid,
  })
  create(@Body() createBidDto: CreateBidDto) {
    return this.bidsService.create(createBidDto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  ///user/my-bids

  @Get('/users/my-bids')
  @ApiBearerAuth()
  @Roles(RoleEnum.user)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Bid),
  })
  async findMyBids(
    @Query() query: FindAllBidsDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<any>> {
    const page = query?.page ?? 1;
    const userId: string = req.user?.id; //
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.bidsService.findMyBidsWithPagination(
        {
          paginationOptions: {
            page,
            limit,
          },
        },
        userId,
      ),
      { page, limit },
    );
  }

  @Post('lease/now')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({
    type: Payment,
  })
  leaseNow(@Body() createLeaseDto: CreateLeaseDto, @Request() req) {
    const user_id: string = req.user?.id;
    return this.bidsService.leaseNow(createLeaseDto, user_id);
  }
}
