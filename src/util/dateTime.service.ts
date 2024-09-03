import { DateTime } from 'luxon'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DateTimeService {
  checkIntersection(
    dateTimeStart1: number,
    dateTimeEnd1: number,
    dateTimeStart2: number,
    dateTimeEnd2: number
  ) {
    return !(dateTimeEnd1 <= dateTimeStart2 || dateTimeEnd2 <= dateTimeStart1)
  }

  checkBefore = (dateTimeSeconds: number) => {
    const currentDateSeconds = DateTime.now()
      .set({ hour: 0, minute: 0, second: 0 })
      .toSeconds()
    return dateTimeSeconds <= currentDateSeconds
  }
}
