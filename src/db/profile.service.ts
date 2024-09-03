import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { Profile, Prisma } from '@prisma/client'

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async one(params: { where?: Prisma.ProfileWhereInput }): Promise<Profile> {
    const { where } = params
    return this.prisma.profile.findFirst({
      where,
    })
  }

  async all(): Promise<Profile[]> {
    return this.prisma.profile.findMany()
  }

  async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return this.prisma.profile.create({
      data,
    })
  }

  async update(params: {
    where: Prisma.ProfileWhereUniqueInput
    data: Prisma.ProfileUpdateInput
  }): Promise<Profile> {
    const { data, where } = params
    return this.prisma.profile.update({
      data,
      where,
    })
  }

  async delete(where: Prisma.ProfileWhereUniqueInput): Promise<Profile> {
    return this.prisma.profile.delete({
      where,
    })
  }
}
