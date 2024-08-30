import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ProfileService } from '../db/profile.service';
import { StorageService } from '../db/storage.service';
import { VicoMainService } from '../db/vicoMain.service';
import {
  Profile as ProfileModel,
  Storage as StorageModel,
  VicoMain as VicoMainModel,
} from '@prisma/client';
import { OptionService } from '../util/option.service';

import { intersects } from 'radash';

interface TechWorkData {
  value: boolean;
  type: number;
}

@WebSocketGateway()
export class WebsocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly options: OptionService,
    private readonly profileService: ProfileService,
    private readonly storageService: StorageService,
    private readonly vicoMainService: VicoMainService,
  ) {}

  private clients: Set<Socket> = new Set();

  @WebSocketServer() server: Server;

  afterInit(server: Server) {}

  handleDisconnect(client: Socket) {
    this.clients.delete(client);
  }

  async handleConnection(client: Socket) {
    this.clients.add(client);
    const clientData = client.handshake.query as {
      login: string;
      version: string;
    };
    const clientLogin = clientData.login.toLowerCase();
    const profile: ProfileModel = await this.profileService.one({
      where: { login: clientLogin },
    });
    let role = 0;
    if (intersects(this.options.superAdministrator, [clientData.login])) {
      role = 4;
    }
    if (profile === null) {
      this.profileService.create({
        login: clientLogin,
        role: role,
        subscribe: { create: {} },
      });
    } else {
      role = profile.role;
    }
    const techWork: StorageModel = await this.storageService.one({
      where: { name: 'TechWork' },
    });
    const vicoMainAll: VicoMainModel[] = await this.vicoMainService.all({
      where: {},
    });
    client.emit('load', {
      role: role,
      optionObject: this.options.optionObject,
      optionTypeVico: this.options.optionTypeVico,
      optionDepartament: this.options.optionDepartament,
      techWork:
        techWork != null
          ? (techWork.data as unknown as TechWorkData).value
          : false,
    });
    client.emit('vicoAll', {
      vicos: vicoMainAll,
    });
  }
}
