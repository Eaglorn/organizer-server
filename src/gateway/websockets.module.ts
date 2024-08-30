import { Module } from '@nestjs/common';
import { DBServiceModule } from '../db/db.module';
import { WebsocketsGateway } from './websockets.gateway';
import { UtilsModule } from '../util/utils.module';

@Module({
  imports: [DBServiceModule, UtilsModule],
  providers: [WebsocketsGateway],
  exports: [WebsocketsGateway],
})
export class WebsocketsGatewayModule {}
