import { Module } from '@nestjs/common';
import { DateTimeService } from './dateTime.service';
import { OptionService } from './option.service';

@Module({
  providers: [DateTimeService, OptionService],
  exports: [DateTimeService, OptionService],
})
export class UtilsModule {}
