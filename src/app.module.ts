import { Module } from '@nestjs/common';
import { DBServiceModule } from './db/db.module';
import { WebsocketsGatewayModule } from './gateway/websockets.module';
import { UtilsModule } from './utils/utils.module';
import { ControllerModule } from './controllers/controller.module';
@Module({
  imports: [
    DBServiceModule,
    WebsocketsGatewayModule,
    DBServiceModule,
    ControllerModule,
    UtilsModule,
  ],
})
export class AppModule {}
