import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { VicoMain, Prisma } from '@prisma/client'

@Injectable()
export class VicoMainService {
  constructor(private prisma: PrismaService) {}

  async one(params: {
    where: Prisma.VicoMainWhereInput
  }): Promise<VicoMain | null> {
    const { where } = params
    return this.prisma.vicoMain.findFirst({
      where: where,
    })
  }

  async all(params: { where: Prisma.VicoMainWhereInput }): Promise<VicoMain[]> {
    const { where } = params
    return this.prisma.vicoMain.findMany({
      where: where,
    })
  }

  async create(params: {
    data: Prisma.VicoMainCreateInput
  }): Promise<VicoMain> {
    const { data } = params
    return this.prisma.vicoMain.create({
      data,
    })
  }

  async update(params: {
    where: Prisma.VicoMainWhereUniqueInput
    data: Prisma.VicoMainUpdateInput
  }): Promise<VicoMain> {
    const { data, where } = params
    return this.prisma.vicoMain.update({
      data,
      where,
    })
  }

  async delete(params: {
    where: Prisma.VicoMainWhereUniqueInput
  }): Promise<VicoMain> {
    const { where } = params
    return this.prisma.vicoMain.delete({
      where,
    })
  }
}
