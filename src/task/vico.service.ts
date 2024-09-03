import { Inject, Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { DateTime } from 'luxon'
import { VicoMain as VicoMainModel } from '@prisma/client'
import { VicoArchiveService } from '../db/vicoArchive.service'
import { VicoMainService } from '../db/vicoMain.service'
import { Logger } from 'winston'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { WebsocketsGateway } from '../gateway/websockets.gateway'

@Injectable()
export class VicoTaskService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly socket: WebsocketsGateway,
    private readonly vicoMainService: VicoMainService,
    private readonly vicoArchiveService: VicoArchiveService
  ) {}

  readonly MainToArchiveSeconds = 7200

  @Cron('0 0 9-23/1 * * 1-5', { name: 'VicoMainToArchive' })
  async VicoMainToArchive() {
    try {
      console.log('Task-VicoMainToArchive')
      const currentDate = DateTime.now().toSeconds()
      const vicos: VicoMainModel[] = await this.vicoMainService.all({
        where: {},
      })
      vicos.forEach((vico) => {
        if (vico.dateTimeEnd - this.MainToArchiveSeconds > currentDate) {
          this.vicoMainService.delete({ where: { id: vico.id } })
          delete vico['id']
          this.vicoArchiveService.create({ data: vico })
          this.socket.server.emit('vicoDelete', { id: vico.id })
          this.logger.info({ type: 'task-archive', ip: 'server', vico })
        }
      })
    } catch (err) {
      console.log(err)
      this.logger.error({
        type: 'archive',
        ip: 'server',
        error: err,
      })
    }
  }
}
