import { Module } from '@nestjs/common';
import { DBServiceModule } from './db/db.module';
import { WebsocketsGatewayModule } from './gateway/websockets.module';
import { UtilsModule } from './utils/utils.module';
import { ControllerModule } from './controllers/controller.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.File({
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            winston.format.json(),
          ),
          dirname: './logs/app/info/',
          filename: 'info.log',
          level: 'info',
          maxsize: 1048576,
          maxFiles: 10,
          zippedArchive: true,
        }),
        new winston.transports.File({
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            winston.format.json(),
          ),
          dirname: './logs/app/error/',
          filename: 'error.log',
          level: 'error',
          maxsize: 1048576,
          maxFiles: 10,
          zippedArchive: true,
        }),
      ],
    }),
    DBServiceModule,
    WebsocketsGatewayModule,
    DBServiceModule,
    ControllerModule,
    UtilsModule,
  ],
})
export class AppModule {}
