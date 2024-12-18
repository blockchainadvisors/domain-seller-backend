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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Payment } from './domain/payment';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllPaymentsDto } from './dto/find-all-payments.dto';

@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiTags('Payments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({
    type: Payment,
  })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiTags('Payments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: InfinityPaginationResponse(Payment),
  })
  async findAll(
    @Query() query: FindAllPaymentsDto,
  ): Promise<InfinityPaginationResponseDto<Payment>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.paymentsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiTags('Payments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Payment,
  })
  findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Patch(':id')
  @ApiTags('Payments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Payment,
  })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiTags('Payments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }

  @Get('user/:userId')
  @ApiTags('Payments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'userId',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: InfinityPaginationResponse(Payment),
  })
  async findAllByUserId(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string, // Optional status filter
  ): Promise<InfinityPaginationResponseDto<Payment>> {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);

    return infinityPagination(
      await this.paymentsService.findAllByUserIdWithPagination(userId, {
        page: pageNumber,
        limit: limitNumber,
        status,
      }),
      { page: pageNumber, limit: limitNumber },
    );
  }

  @Post('initiate-payment/:paymentId')
  @ApiTags('Payments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    name: 'paymentId',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Payment,
  })
  async initiatePayment(@Param('paymentId') paymentId: string) {
    return this.paymentsService.initiatePayment(paymentId);
  }

  @Post('complete-payment/:paymentId')
  @ApiParam({
    name: 'paymentId',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Payment,
  })
  async completePayment(@Param('paymentId') paymentId: string) {
    return this.paymentsService.completePayment(paymentId);
  }
}
