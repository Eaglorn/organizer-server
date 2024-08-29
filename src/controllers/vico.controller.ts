import { Controller, Post, Req, Res, Ip } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { DateTimeService } from '../utils/dateTime.service';
import { ProfileService } from '../db/profile.service';
import { VicoMainService } from '../db/vicoMain.service';
import {
  Profile as ProfileModel,
  VicoMain as VicoMainModel,
} from '@prisma/client';
import { OptionService } from '../utils/option.service';
import { WebsocketsGateway } from '../gateway/websockets.gateway';
import { unique, intersects } from 'radash';
import { DateTime } from 'luxon';

@Controller('vico')
export class VicoController {
  constructor(
    private readonly socket: WebsocketsGateway,
    private readonly options: OptionService,
    private readonly dateTime: DateTimeService,
    private readonly profileService: ProfileService,
    private readonly vicoMainService: VicoMainService,
  ) {}

  @Post('add')
  async add(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
    @Ip() ip: string,
  ) {
    const body = request.body as {
      vico: VicoMainModel;
      login: string;
      computer: string;
    };
    const profile: ProfileModel = await this.profileService.one({
      where: { login: body.login.toLowerCase() },
    });
    let access = { success: true, message: '' };
    if (
      profile.role < 1 &&
      !intersects(this.options.superAdministrator, [body.login.toLowerCase()])
    ) {
      access = {
        success: false,
        message: 'У вас нет прав на создания записи ВКС',
      };
    }
    if (this.dateTime.checkBefore(body.vico.dateTimeStart)) {
      access = {
        success: false,
        message: 'Запись ВКС не может быть создана в прошедших днях',
      };
    }
    if (body.vico.dateTimeStart > body.vico.dateTimeEnd) {
      access = {
        success: false,
        message: 'Начало ВКС не может быть позднее окончания',
      };
    }
    if (!access.success) {
      response.send({ success: false, message: access.message });
    } else {
      let typeVico = {};
      if (body.vico.typeVico === 'Допрос') {
        typeVico = body.vico.typeVico;
      } else {
        typeVico = { not: 'Допрос' };
      }
      const vicos: VicoMainModel[] = await this.vicoMainService.all({
        where: {
          dateTimeStart: {
            gte: DateTime.fromSeconds(body.vico.dateTimeStart)
              .set({ hour: 0, minute: 0, second: 0 })
              .toSeconds(),
            lte: DateTime.fromSeconds(body.vico.dateTimeStart)
              .set({ hour: 23, minute: 59, second: 59 })
              .toSeconds(),
          },
          typeVico,
        },
      });
      let isVicoCreate = false;
      if (vicos.length > 0) {
        let isCollision = false;
        const objectCollision = new Set();
        vicos.forEach((vico) => {
          if (
            this.dateTime.checkIntersection(
              body.vico.dateTimeStart,
              body.vico.dateTimeEnd,
              vico.dateTimeStart,
              vico.dateTimeEnd,
            )
          ) {
            const vicoSet = new Set([
              vico.objectInitiator,
              ...vico.objectInvited,
            ]);
            const combinedArray = [
              body.vico.objectInitiator,
              ...body.vico.objectInvited,
            ];
            combinedArray.forEach((item) => {
              if (vicoSet.has(item)) {
                isCollision = true;
                objectCollision.add({
                  object: item,
                  timeStart: vico.dateTimeStart,
                  timeEnd: vico.dateTimeEnd,
                });
              }
            });
          }
        });
        if (isCollision) {
          response.send({
            success: true,
            collision: true,
            message: unique(Array.from(objectCollision)),
          });
        } else {
          isVicoCreate = true;
        }
      } else {
        isVicoCreate = true;
      }
      if (isVicoCreate) {
        const vicoNew = await this.vicoMainService.create({ data: body.vico });
        this.socket.server.emit('vicoAdd', vicoNew);
        response.send({ success: true });
      }
    }
  }
}
