import { Module } from '@nestjs/common'
import { DBServiceModule } from '../db/db.module'
import { UtilsModule } from '../util/utils.module'
import { WebsocketsGatewayModule } from '../gateway/websockets.module'
import { VicoTaskService } from './vico.service'

@Module({
  imports: [DBServiceModule, UtilsModule, WebsocketsGatewayModule],
  providers: [VicoTaskService],
})
export class TaskModule {}
