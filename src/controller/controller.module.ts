import { Module } from '@nestjs/common'
import { VicoController } from './vico.controller'
import { AdminController } from './admin.controller'
import { DBServiceModule } from '../db/db.module'
import { UtilsModule } from '../util/utils.module'
import { WebsocketsGatewayModule } from '../gateway/websockets.module'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard } from '@nestjs/throttler'

@Module({
  imports: [DBServiceModule, UtilsModule, WebsocketsGatewayModule],
  controllers: [VicoController, AdminController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ControllerModule {}
