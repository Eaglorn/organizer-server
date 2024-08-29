import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { StorageService } from './storage.service';
import { ProfileService } from './profile.service';
import { SubscribeService } from './subscribe.service';
import { VicoArchiveService } from './vicoArchive.service';
import { VicoMainService } from './vicoMain.service';

@Module({
  providers: [
    PrismaService,
    StorageService,
    ProfileService,
    SubscribeService,
    VicoArchiveService,
    VicoMainService,
  ],
  exports: [
    ProfileService,
    StorageService,
    VicoMainService,
    VicoArchiveService,
  ],
})
export class DBServiceModule {}
