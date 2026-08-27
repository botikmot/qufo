import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';

import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { ChangePasswordDto } from './dto/change-password.dto';

import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsSecurityController {
  constructor(private readonly settingsService: SettingsService) {}

  @Patch('password')
  changePassword(
    @CurrentUser()
    user: JwtPayload,

    @Body()
    dto: ChangePasswordDto,
  ) {
    return this.settingsService.changePassword(user, dto);
  }

  @Post('profile/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (_request, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Only JPG, PNG, and WebP images are allowed.',
            ),
            false,
          );

          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadAvatar(
    @CurrentUser()
    user: JwtPayload,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.settingsService.uploadProfileAvatar(user, file);
  }

  @Delete('profile/avatar')
  removeAvatar(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.settingsService.removeProfileAvatar(user);
  }
}
