import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PrepareResponse } from 'src/helpers/prepareResponse';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkUserExists(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: id,
        },
      });

      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Error) {
        throw new HttpException(
          `Error checking if user exists: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'An unknown error occurred while fetching user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          fullname: createUserDto.fullname,
          email: createUserDto.email,
          password: createUserDto.password,
        },
      });
    } catch (error: unknown) {
      console.error('Error:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            `User with email ${createUserDto.email} already exists.`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (error instanceof Error) {
        throw new HttpException(
          `Error creating user: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'An unknown error occurred while creating user.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(per_page: string, page: string) {
    try {
      const users = await this.prisma.user.findMany({
        skip: Number(per_page) * (Number(page) - 1),
        take: Number(per_page),
        include: {
          comments: true,
          discussions: true,
          opinions: true,
        },
      });

      if (users.length === 0) {
        throw new HttpException(`No users found`, HttpStatus.NOT_FOUND);
      }
      const allUsers = await this.prisma.user.findMany();
      return PrepareResponse(
        users,
        allUsers.length,
        Math.ceil(allUsers.length / Number(per_page)),
        Number(page),
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Error) {
        throw new HttpException(
          `Error getting users: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'An unknown error occurred while fetching users',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Error) {
        throw new HttpException(
          `Error getting user: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'An unknown error occurred while fetching users',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.checkUserExists(id);

      const user = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          fullname: updateUserDto.fullname ?? undefined,
          email: updateUserDto.email ?? undefined,
          password: updateUserDto.password ?? undefined,
          phone: updateUserDto.phone ?? undefined,
          bio: updateUserDto.bio ?? undefined,
          role: updateUserDto.role ?? undefined,
        },
      });

      return user;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Error) {
        throw new HttpException(
          `Error checking if user exists: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'An unknown error occurred while fetching user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async remove(id: string) {
    try {
      await this.checkUserExists(id);
      const user = await this.prisma.user.delete({
        where: {
          id: id,
        },
      });
      return user;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Error) {
        throw new HttpException(
          `Error checking if user exists: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'An unknown error occurred while fetching user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
