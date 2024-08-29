import { Inject, Controller, Post, Req, Res, Ip } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { DateTimeService } from '../utils/dateTime.service';
import { ProfileService } from '../db/profile.service';
import { VicoMainService } from '../db/vicoMain.service';
import {
  Profile as ProfileModel,
  VicoMain as VicoMainModel,
  VicoArchive as VicoArchiveModel,
} from '@prisma/client';
import { OptionService } from '../utils/option.service';
import { WebsocketsGateway } from '../gateway/websockets.gateway';
import { unique, intersects } from 'radash';
import { DateTime } from 'luxon';
import { VicoArchiveService } from 'src/db/vicoArchive.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('vico')
export class VicoController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly socket: WebsocketsGateway,
    private readonly options: OptionService,
    private readonly dateTime: DateTimeService,
    private readonly profileService: ProfileService,
    private readonly vicoMainService: VicoMainService,
    private readonly vicoArchiveService: VicoArchiveService,
  ) {}

  @Post('one')
  async one(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
    @Ip() ip: string,
  ) {
    const body = request.body as {
      id: number;
      login: string;
      computer: string;
    };
    try {
      const vico = await this.vicoMainService.one({
        where: {
          id: body.id,
        },
      });
      response.send({ success: true, vico });
    } catch (err) {
      console.log(err);
      this.logger.error({
        type: 'vico-one',
        ip: ip,
        login: body.login,
        computer: body.computer,
      });
      response.send({
        success: false,
        message: 'Непредвиденная ошибка на сервере',
      });
    }
  }

  @Post('all')
  async all(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
    @Ip() ip: string,
  ) {
    const body = request.body as { login: string; computer: string };
    try {
      const vicos = await this.vicoMainService.all({ where: {} });
      response.send({ success: true, vicos });
    } catch (err) {
      console.log(err);
      this.logger.error({
        type: 'vico-all',
        ip: ip,
        login: body.login,
        computer: body.computer,
      });
      response.send({
        success: false,
        message: 'Непредвиденная ошибка на сервере',
      });
    }
  }

  @Post('create')
  async create(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
    @Ip() ip: string,
  ) {
    const body = request.body as {
      vico: VicoMainModel;
      login: string;
      computer: string;
    };
    try {
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
          const vicoNew = await this.vicoMainService.create({
            data: body.vico,
          });
          this.logger.info({
            type: 'vico-create',
            ip: ip,
            login: body.login,
            computer: body.computer,
            vico: vicoNew,
          });
          this.socket.server.emit('vicoCreate', vicoNew);
          response.send({ success: true });
        }
      }
    } catch (err) {
      console.log(err);
      this.logger.error({
        type: 'vico-create',
        ip: ip,
        login: body.login,
        computer: body.computer,
      });
      response.send({
        success: false,
        message: 'Непредвиденная ошибка на сервере',
      });
    }
  }

  @Post('update')
  async update(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
    @Ip() ip: string,
  ) {
    const body = request.body as {
      id: number;
      vico: VicoMainModel;
      login: string;
      computer: string;
    };
    try {
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
          message: 'У вас нет прав на изменение записи ВКС',
        };
      }
      if (this.dateTime.checkBefore(body.vico.dateTimeStart)) {
        access = {
          success: false,
          message: 'Запись ВКС не может быть изменена на прошедший день',
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
            id: { not: body.id },
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
        let isVicoEdit = false;
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
            return response.send({
              success: true,
              collision: true,
              message: unique(Array.from(objectCollision)),
            });
          } else {
            isVicoEdit = true;
          }
        } else {
          isVicoEdit = true;
        }
        if (isVicoEdit) {
          const source: VicoMainModel = await this.vicoMainService.one({
            where: { id: body.id },
          });
          const result: VicoMainModel = await this.vicoMainService.update({
            where: { id: body.id },
            data: body.vico,
          });
          this.logger.info({
            type: 'vico-update',
            ip: ip,
            login: body.login,
            computer: body.computer,
            source: source,
            result: result,
          });
          this.socket.server.emit('vicoUpdate', { vico: result });
          response.send({ success: true });
        }
      }
    } catch (err) {
      console.log(err);
      this.logger.error({
        type: 'vico-update',
        ip: ip,
        login: body.login,
        computer: body.computer,
      });
      response.send({
        success: false,
        message: 'Непредвиденная ошибка на сервере',
      });
    }
  }

  @Post('moved')
  async moved(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
    @Ip() ip: string,
  ) {
    const body = request.body as {
      id: number;
      vico: VicoMainModel;
      login: string;
      computer: string;
    };
    try {
      const profile: ProfileModel = await this.profileService.one({
        where: {
          login: body.login,
        },
      });
      if (
        profile.role < 1 &&
        !intersects(this.options.superAdministrator, [body.login.toLowerCase()])
      ) {
        response.send({
          success: false,
          message: 'У вас нет прав на перенос записи ВКС в архив',
        });
      } else {
        const source: VicoMainModel = await this.vicoMainService.delete({
          where: {
            id: body.id,
          },
        });
        this.socket.server.emit('vicoDelete', { id: source.id });
        delete source.id;
        const result: VicoArchiveModel = await this.vicoArchiveService.create({
          data: source,
        });
        this.logger.info({
          type: 'vico-archive',
          ip: ip,
          login: body.login,
          computer: body.computer,
          archive: result,
        });
      }
    } catch (err) {
      console.log(err);
      this.logger.error({
        type: 'vico-moved',
        ip: ip,
        login: body.login,
        computer: body.computer,
      });
      response.send({
        success: false,
        message: 'Непредвиденная ошибка на сервере',
      });
    }
  }

  @Post('delete')
  async delete(
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
    @Ip() ip: string,
  ) {
    const body = request.body as {
      id: number;
      login: string;
      computer: string;
    };
    try {
      const profile: ProfileModel = await this.profileService.one({
        where: {
          login: body.login,
        },
      });

      if (
        profile.role < 1 &&
        !intersects(this.options.superAdministrator, [body.login.toLowerCase()])
      ) {
        response.send({
          success: false,
          message: 'У вас нет прав на удаление записи ВКС',
        });
      } else {
        const vico: VicoMainModel = await this.vicoMainService.delete({
          where: { id: body.id },
        });
        this.socket.server.emit('vicoDelete', { id: vico.id });
        this.logger.info({
          type: 'vico-delete',
          ip: ip,
          login: body.login,
          computer: body.computer,
          vico,
        });
        response.send({ success: true });
      }
    } catch (err) {
      console.log(err);
      this.logger.error({
        type: 'vico-delete',
        ip: ip,
        login: body.login,
        computer: body.computer,
      });
      response.send({
        success: false,
        message: 'Непредвиденная ошибка на сервере',
      });
    }
  }
}
