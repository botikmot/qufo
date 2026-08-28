import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TenantGuard } from './guards/tenant.guard';
import { SubscriptionGuard } from './guards/subscription.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { PlatformAdminGuard } from './guards/platform-admin.guard';
import { GoogleAuthService } from './google-auth.service';

@Module({
  imports: [
    ConfigModule,

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    TenantGuard,
    RolesGuard,
    SubscriptionGuard,
    PlatformAdminGuard,
    GoogleAuthService,
  ],
  exports: [
    AuthService,
    AuthGuard,
    TenantGuard,
    RolesGuard,
    SubscriptionGuard,
    PlatformAdminGuard,
  ],
})
export class AuthModule {}
