import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { PrismaService } from 'src/prisma.service';
import { Opinion } from '@prisma/client';
import { handleError } from 'src/helpers/handleError';
import { isValidUUID } from 'src/helpers/isValidUUID';
import { PrepareResponse } from 'src/helpers/prepareResponse';
import { PaginatedResponse } from 'src/types/types';

@Injectable()
export class OpinionsService {
  constructor(private readonly prisma: PrismaService) {}
  async checkOpinionExists(id: string): Promise<Opinion | null> {
    try {
      isValidUUID(id);
      const opinion = await this.prisma.opinion.findFirst({
        where: {
          id: id,
        },
        include: {
          author: true,
          discussion: true,
        },
      });
      if (!opinion) {
        throw new HttpException(`Opinion not found`, HttpStatus.NOT_FOUND);
      }
      return opinion;
    } catch (error) {
      handleError(error, 'Error checking opinion existence');
    }
  }
  async create(createOpinionDto: CreateOpinionDto): Promise<Opinion | null> {
    try {
      const newOpinion = await this.prisma.opinion.create({
        data: { ...createOpinionDto },
        include: {
          author: true,
          discussion: true,
        },
      });
      if (!newOpinion) {
        throw new HttpException(`Opinion not created `, HttpStatus.NOT_FOUND);
      }
      return newOpinion;
    } catch (error) {
      handleError(error, 'Error creating a new opinion');
    }
  }

  async findAll(
    per_page: string,
    page: string,
  ): Promise<PaginatedResponse<Opinion> | null> {
    try {
      const opinions = await this.prisma.opinion.findMany({
        take: Number(per_page),
        skip: (Number(page) - 1) * Number(per_page),
        include: {
          author: true,
          discussion: true,
        },
      });
      if (opinions.length === 0) {
        throw new HttpException(`Opinions not found`, HttpStatus.NOT_FOUND);
      }
      const allOpinions = await this.prisma.opinion.findMany();
      return PrepareResponse(
        opinions,
        allOpinions.length,
        Math.ceil(allOpinions.length / Number(per_page)),
        Number(page),
      );
    } catch (error) {
      handleError(error, 'Error finding all opinions');
    }
  }

  async findOne(id: string): Promise<Opinion | null> {
    try {
      return await this.checkOpinionExists(id);
    } catch (error) {
      handleError(error, 'Error finding a opinion');
    }
  }

  async update(
    id: string,
    updateOpinionDto: UpdateOpinionDto,
  ): Promise<Opinion | null> {
    try {
      await this.checkOpinionExists(id);
      const updatedOpinion = await this.prisma.opinion.update({
        where: {
          id: id,
        },
        data: {
          content: updateOpinionDto.content ?? undefined,
          authorId: updateOpinionDto.authorId ?? undefined,
          discussionId: updateOpinionDto.discussionId ?? undefined,
        },
        include: {
          author: true,
          discussion: true,
        },
      });
      if (!updatedOpinion) {
        throw new HttpException(`Opinion not updated`, HttpStatus.NOT_FOUND);
      }
      return updatedOpinion;
    } catch (error) {
      handleError(error, 'Error updating opinion');
    }
  }

  async remove(id: string): Promise<Opinion | null> {
    try {
      await this.checkOpinionExists(id);
      const deletedOpinion = await this.prisma.opinion.delete({
        where: {
          id: id,
        },
        include: {
          author: true,
          discussion: true,
        },
      });
      if (!deletedOpinion) {
        throw new HttpException(`Opinion not deleted`, HttpStatus.NOT_FOUND);
      }
      return deletedOpinion;
    } catch (error) {
      handleError(error, 'Error deleting opinion');
    }
  }
}
