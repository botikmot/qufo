import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
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

  private setRefreshCookie(response: Response, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie('qufo_refresh_token', refreshToken, {
      httpOnly: true,

      secure: isProduction,

      sameSite: 'lax',

      path: '/api/auth',

      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private getRefreshToken(request: Request): string | undefined {
    const cookies = request.cookies as Record<string, string> | undefined;

    return cookies?.['qufo_refresh_token'];
  }

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
  async login(
    @Body()
    dto: LoginDto,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const result = await this.authService.login(dto);

    this.setRefreshCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,

      user: result.user,

      organizations: result.organizations,
    };
  }

  @Post('refresh')
  async refresh(
    @Req()
    request: Request,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const refreshToken = this.getRefreshToken(request);

    const result = await this.authService.refresh(refreshToken);

    this.setRefreshCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  async logout(
    @Req()
    request: Request,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const refreshToken = this.getRefreshToken(request);

    await this.authService.logout(refreshToken);

    response.clearCookie('qufo_refresh_token', {
      path: '/api/auth',
    });

    return {
      message: 'Logged out successfully.',
    };
  }
}
