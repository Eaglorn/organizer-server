import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { VicoArchive, Prisma } from '@prisma/client';

@Injectable()
export class VicoArchiveService {
  constructor(private prisma: PrismaService) {}

  async vicoArchive(
    vicoArchiveWhereUniqueInput: Prisma.VicoArchiveWhereUniqueInput,
  ): Promise<VicoArchive | null> {
    return this.prisma.vicoArchive.findUnique({
      where: vicoArchiveWhereUniqueInput,
    });
  }

  async vicoArchives(): Promise<VicoArchive[]> {
    return this.prisma.vicoArchive.findMany();
  }

  async createVicoArchive(
    data: Prisma.VicoArchiveCreateInput,
  ): Promise<VicoArchive> {
    return this.prisma.vicoArchive.create({
      data,
    });
  }

  async updateVicoArchive(params: {
    where: Prisma.VicoArchiveWhereUniqueInput;
    data: Prisma.VicoArchiveUpdateInput;
  }): Promise<VicoArchive> {
    const { data, where } = params;
    return this.prisma.vicoArchive.update({
      data,
      where,
    });
  }

  async deleteVicoArchive(
    where: Prisma.VicoArchiveWhereUniqueInput,
  ): Promise<VicoArchive> {
    return this.prisma.vicoArchive.delete({
      where,
    });
  }
}
