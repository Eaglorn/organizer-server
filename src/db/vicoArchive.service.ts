import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { VicoArchive, Prisma } from '@prisma/client';

@Injectable()
export class VicoArchiveService {
  constructor(private prisma: PrismaService) {}

  async one(params: {
    where: Prisma.VicoArchiveWhereInput;
  }): Promise<VicoArchive | null> {
    const { where } = params;
    return this.prisma.vicoArchive.findFirst({
      where,
    });
  }

  async all(): Promise<VicoArchive[]> {
    return this.prisma.vicoArchive.findMany();
  }

  async create(params: {
    data: Prisma.VicoArchiveCreateInput;
  }): Promise<VicoArchive> {
    const { data } = params;
    return this.prisma.vicoArchive.create({
      data,
    });
  }

  async update(params: {
    where: Prisma.VicoArchiveWhereUniqueInput;
    data: Prisma.VicoArchiveUpdateInput;
  }): Promise<VicoArchive> {
    const { data, where } = params;
    return this.prisma.vicoArchive.update({
      data,
      where,
    });
  }

  async delete(
    where: Prisma.VicoArchiveWhereUniqueInput,
  ): Promise<VicoArchive> {
    return this.prisma.vicoArchive.delete({
      where,
    });
  }
}
