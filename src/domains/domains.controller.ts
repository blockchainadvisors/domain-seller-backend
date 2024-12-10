import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Domain } from './domain/domain';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllDomainsDto } from './dto/find-all-domains.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { Request } from '@nestjs/common';

@ApiTags('Domains')
@Controller({
  path: 'domains',
  version: '1',
})
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiCreatedResponse({
    type: Domain,
  })
  create(@Body() createDomainDto: CreateDomainDto) {
    return this.domainsService.create(createDomainDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: InfinityPaginationResponse(Domain),
  })
  async findAll(
    @Query() query: FindAllDomainsDto,
  ): Promise<InfinityPaginationResponseDto<Domain>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.domainsService.findAllWithPagination({
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
    type: Domain,
  })
  findById(@Param('id') id: string) {
    return this.domainsService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Domain,
  })
  update(@Param('id') id: string, @Body() updateDomainDto: UpdateDomainDto) {
    return this.domainsService.update(id, updateDomainDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.domainsService.remove(id);
  }

  @Get('/users/my-domains')
  @ApiBearerAuth()
  @Roles(RoleEnum.user)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Domain),
  })
  async findMyBids(
    @Query() query: FindAllDomainsDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<any>> {
    const page = query?.page ?? 1;
    const userId: string = req.user?.id; //
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.domainsService.findMyDomainsWithPagination(
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
}
