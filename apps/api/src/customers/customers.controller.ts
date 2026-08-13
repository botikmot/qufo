import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { CustomersService } from './customers.service';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';

@Controller('customers')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: CreateCustomerDto,
  ) {
    return this.customersService.create(user, tenant, dto);
  }

  @Get()
  findAll(
    @CurrentTenant()
    tenant: TenantContext,

    @Query()
    query: CustomerQueryDto,
  ) {
    return this.customersService.findAll(tenant, query);
  }

  @Get(':id')
  findOne(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.customersService.findOne(tenant, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,

    @Body()
    dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(tenant, id, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    await this.customersService.archive(tenant, id);
  }
}
