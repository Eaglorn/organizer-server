import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { Subscribe, Prisma } from '@prisma/client'

@Injectable()
export class SubscribeService {
  constructor(private readonly prisma: PrismaService) {}

  async Subscribe(
    SubscribeWhereUniqueInput: Prisma.SubscribeWhereUniqueInput
  ): Promise<Subscribe | null> {
    return this.prisma.subscribe.findUnique({
      where: SubscribeWhereUniqueInput,
    })
  }

  async Subscribes(): Promise<Subscribe[]> {
    return this.prisma.subscribe.findMany()
  }

  async createSubscribe(data: Prisma.SubscribeCreateInput): Promise<Subscribe> {
    return this.prisma.subscribe.create({
      data,
    })
  }

  async updateSubscribe(params: {
    where: Prisma.SubscribeWhereUniqueInput
    data: Prisma.SubscribeUpdateInput
  }): Promise<Subscribe> {
    const { data, where } = params
    return this.prisma.subscribe.update({
      data,
      where,
    })
  }
}
