import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { Storage, Prisma } from '@prisma/client'

@Injectable()
export class StorageService {
  constructor(private readonly prisma: PrismaService) {}

  async one(params: { where?: Prisma.StorageWhereInput }): Promise<Storage> {
    const { where } = params
    return this.prisma.storage.findFirst({
      where,
    })
  }

  async all(): Promise<Storage[]> {
    return this.prisma.storage.findMany()
  }

  async create(data: Prisma.StorageCreateInput): Promise<Storage> {
    return this.prisma.storage.create({
      data,
    })
  }

  async update(params: {
    where: Prisma.StorageWhereUniqueInput
    data: Prisma.StorageUpdateInput
  }): Promise<Storage> {
    const { data, where } = params
    return this.prisma.storage.update({
      data,
      where,
    })
  }
}
