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

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DnsSettings } from './domain/dns-settings';
import { AuthGuard } from '@nestjs/passport';
import { Request } from '@nestjs/common';
import { UpdateDnsRecordsDto } from './dto/update-dns-records.dto';
import { CreateDnsRecordsDto } from './dto/create-dns-records.dto';

@ApiTags('Dnssettings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'dns-settings',
  version: '1',
})
export class DnsSettingsController {
  constructor(private readonly dnsSettingsService: DnsSettingsService) {}

  // @Post()
  // @ApiCreatedResponse({
  //   type: DnsSettings,
  // })
  // create(@Body() createDnsSettingsDto: CreateDnsSettingsDto) {
  //   return this.dnsSettingsService.create(createDnsSettingsDto);
  // }

  // @Get()
  // @ApiOkResponse({
  //   type: InfinityPaginationResponse(DnsSettings),
  // })
  // async findAll(
  //   @Query() query: FindAllDnsSettingsDto,
  // ): Promise<InfinityPaginationResponseDto<DnsSettings>> {
  //   const page = query?.page ?? 1;
  //   let limit = query?.limit ?? 10;
  //   if (limit > 50) {
  //     limit = 50;
  //   }

  //   return infinityPagination(
  //     await this.dnsSettingsService.findAllWithPagination({
  //       paginationOptions: {
  //         page,
  //         limit,
  //       },
  //     }),
  //     { page, limit },
  //   );
  // }

  @Get('domains/:domain_id/records')
  @ApiParam({
    name: 'domain_id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: DnsSettings,
  })
  findDnsRecords(@Param('domain_id') domain_id: string, @Request() req) {
    const user_id: string = req.user?.id;
    return this.dnsSettingsService.findRecords(domain_id, user_id);
  }

  @Get('domains/:domain_id')
  @ApiParam({
    name: 'domain_id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: DnsSettings,
  })
  findDomainDetails(@Param('domain_id') domain_id: string, @Request() req) {
    const user_id: string = req.user?.id;
    return this.dnsSettingsService.findDomainDetails(domain_id, user_id);
  }

  @Patch('domains/:domain_id/records/:type/:name')
  @ApiParam({
    name: 'domain_id',
    type: String,
    required: true,
    description: 'The ID of the domain to update the DNS record for',
  })
  @ApiParam({
    name: 'type',
    type: String,
    required: true,
    description: 'The type of DNS record (e.g., A, CNAME, TXT)',
  })
  @ApiParam({
    name: 'name',
    type: String,
    required: true,
    description: 'The name of the DNS record to update',
  })
  @ApiOkResponse({
    type: DnsSettings,
    description: 'Updated DNS settings',
  })
  updateRecord(
    @Param('domain_id') domainId: string,
    @Param('type') recordType: string,
    @Param('name') recordName: string,
    @Body() updateDnsRecordsDto: UpdateDnsRecordsDto,
    @Request() req,
  ) {
    const user_id: string = req.user?.id;
    return this.dnsSettingsService.updateRecord(
      domainId,
      user_id,
      recordType,
      recordName,
      updateDnsRecordsDto,
    );
  }

  @Patch('domains/:domain_id/records')
  @ApiParam({
    name: 'domain_id',
    type: String,
    required: true,
    description: 'The ID of the domain to update the DNS record for',
  })
  @ApiOkResponse({
    type: DnsSettings,
    description: 'Updated DNS settings',
  })
  addNewDnsRecord(
    @Param('domain_id') domainId: string,
    @Body() createDnsRecordsDto: CreateDnsRecordsDto,
    @Request() req,
  ) {
    const user_id: string = req.user?.id;
    return this.dnsSettingsService.addNewDnsRecord(
      domainId,
      user_id,
      createDnsRecordsDto,
    );
  }
}
