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
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { GoogleLoginDto } from './dto/google-login.dto';
import { CompleteGoogleRegistrationDto } from './dto/complete-google-registration.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',

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

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 3,
      ttl: 10 * 60 * 1000,
    },
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 10,
      ttl: 60 * 1000,
    },
  })
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

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 30,
      ttl: 60 * 1000,
    },
  })
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

  @Post('google')
  googleLogin(
    @Body()
    dto: GoogleLoginDto,
  ) {
    return this.authService.googleLogin(dto);
  }

  @Post('google/complete')
  completeGoogleRegistration(
    @Body()
    dto: CompleteGoogleRegistrationDto,
  ) {
    return this.authService.completeGoogleRegistration(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
