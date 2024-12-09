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
import { DnsSettingsService } from './dns-settings.service';
import { CreateDnsSettingsDto } from './dto/create-dns-settings.dto';
import { UpdateDnsSettingsDto } from './dto/update-dns-settings.dto';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DnsSettings } from './domain/dns-settings';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllDnsSettingsDto } from './dto/find-all-dns-settings.dto';

@ApiTags('Dnssettings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'dns-settings',
  version: '1',
})
export class DnsSettingsController {
  constructor(private readonly dnsSettingsService: DnsSettingsService) {}

  @Post()
  @ApiCreatedResponse({
    type: DnsSettings,
  })
  create(@Body() createDnsSettingsDto: CreateDnsSettingsDto) {
    return this.dnsSettingsService.create(createDnsSettingsDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(DnsSettings),
  })
  async findAll(
    @Query() query: FindAllDnsSettingsDto,
  ): Promise<InfinityPaginationResponseDto<DnsSettings>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.dnsSettingsService.findAllWithPagination({
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
    type: DnsSettings,
  })
  findById(@Param('id') id: string) {
    return this.dnsSettingsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: DnsSettings,
  })
  update(
    @Param('id') id: string,
    @Body() updateDnsSettingsDto: UpdateDnsSettingsDto,
  ) {
    return this.dnsSettingsService.update(id, updateDnsSettingsDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.dnsSettingsService.remove(id);
  }
}
