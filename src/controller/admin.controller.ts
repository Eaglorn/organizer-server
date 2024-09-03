import { Inject, Controller, Post, Req, Res, Ip } from '@nestjs/common'
import { FastifyRequest, FastifyReply } from 'fastify'
import { ProfileService } from '../db/profile.service'
import { StorageService } from '../db/storage.service'
import { OptionService } from '../util/option.service'
import { WebsocketsGateway } from '../gateway/websockets.gateway'
import { intersects } from 'radash'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Throttle } from '@nestjs/throttler'

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly socket: WebsocketsGateway,
    private readonly options: OptionService,
    private readonly storageService: StorageService,
    private readonly profileService: ProfileService
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('techWork')
  async one(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
    @Ip() ip: string
  ) {
    const body = request.body as {
      type: number
      login: string
      computer: string
    }
    try {
      const profile = await this.profileService.one({
        where: { login: body.login },
      })

      if (
        profile.role < 3 &&
        !intersects(this.options.superAdministrator, [body.login.toLowerCase()])
      ) {
        response.send({
          success: false,
          message:
            'У вас нет прав на ввод приложения в режим технических работ.',
        })
      } else {
        let techWork: any = await this.storageService.one({
          where: { name: 'TechWork' },
        })
        if (techWork === null) {
          this.storageService.create({
            name: 'TechWork',
            data: {
              value: true,
              type: body.type,
            },
          })
          this.socket.server.emit('techWorkStart')
          response.send({ success: true, result: true })
        } else {
          let type = 0
          if (techWork.data.value) {
            type = techWork.data.type
          } else {
            type = body.type
          }
          techWork = await this.storageService.update({
            where: { id: techWork.id },
            data: {
              data: {
                value: !techWork.data.value,
                type: type,
              },
            },
          })
          if (techWork.data.value) {
            this.socket.server.emit('techWorkStart')
          } else {
            this.socket.server.emit('techWorkEnd', {
              type: techWork.data.type,
            })
          }
          response.send({ success: true, result: techWork.data.value })
        }
      }
      response.send({ success: true })
    } catch (err) {
      console.log(err)
      this.logger.error({
        type: 'admin-techWork',
        ip: ip,
        login: body.login,
        computer: body.computer,
      })
      response.send({
        success: false,
        message: 'Непредвиденная ошибка на сервере',
      })
    }
  }
}
