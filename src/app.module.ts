import { Module } from '@nestjs/common';
import { DBServiceModule } from './db/db.module';
import { WebsocketsGatewayModule } from './gateway/websockets.module';
import { UtilsModule } from './util/utils.module';
import { ControllerModule } from './controller/controller.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './task/task.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ThrottlerModule.forRoot([]),
    DBServiceModule,
    WebsocketsGatewayModule,
    DBServiceModule,
    ControllerModule,
    UtilsModule,
    ScheduleModule.forRoot(),
    TaskModule,
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
