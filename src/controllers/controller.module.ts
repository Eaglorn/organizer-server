import { Module } from '@nestjs/common';
import { VicoController } from './vico.controller';
import { DBServiceModule } from '../db/db.module';
import { UtilsModule } from '../utils/utils.module';
import { WebsocketsGatewayModule } from '../gateway/websockets.module';

@Module({
  imports: [DBServiceModule, UtilsModule, WebsocketsGatewayModule],
  controllers: [VicoController],
})
export class ControllerModule {}
