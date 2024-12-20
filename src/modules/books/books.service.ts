import { Injectable } from '@nestjs/common';
import { BooksDto, QueryParams, UpdateBooksDto } from 'src/dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async post(dto: BooksDto) {
    const result = await this.prisma.$transaction(async (prisma) => {
      const data = await prisma.books.create({
        data: {
          title: dto.title,
          author: dto.author,
          stock: dto.stock,
          code: dto.code,
        },
      });

      return data;
    });
    return result;
  }

  async update(id: number, dto: UpdateBooksDto) {
    const result = await this.prisma.$transaction(async (prisma) => {
      const data = await prisma.books.update({
        where: {
          id: id,
        },
        data: {
          title: dto.title,
          author: dto.author,
          stock: dto.stock,
        },
      });

      return data;
    });
    return result;
  }

  async delete(id: number) {
    const result = await this.prisma.$transaction(async (prisma) => {
      const data = await prisma.books.delete({
        where: {
          id: id,
        },
      });

      return data;
    });
    return result;
  }

  async get(params: QueryParams) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;
    const query = [];

    if (params.keyword) {
      query.push({
        title: {
          contains: params.keyword,
          mode: 'insensitive',
        },
      });
    }

    const [total_data, data] = await Promise.all([
      this.prisma.books.count({
        where: {
          AND: query,
        },
      }),
      this.prisma.books.findMany({
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
        where: {
          AND: query,
        },
        orderBy: {
          [params.order_by]: params.sort,
        },
      }),
    ]);

    return { total_data, data };
  }
}
