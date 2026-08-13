import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import type { JwtPayload } from './types/jwt-payload.type';
import { AuthGuard } from './guards/auth.guard';
import { CurrentTenant } from './decorators/current-tenant.decorator';

import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { TenantGuard } from './guards/tenant.guard';
import type { TenantContext } from './types/tenant-context.type';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard, TenantGuard)
  @Get('context')
  getContext(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return {
      user,
      tenant,
    };
  }

  @Roles('OWNER')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Get('owner-check')
  ownerCheck(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return {
      message: 'Owner access granted.',
      tenant,
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Req() request: AuthenticatedRequest) {
    return {
      user: request.user,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
