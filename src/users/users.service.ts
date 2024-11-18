import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';

import { UpdateUserDto } from './dto/update-user.dto';

import { User } from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { PaginatedResponse, Role } from 'src/types/types';
import { PrepareResponse } from 'src/helpers/prepareResponse';
import { handleError } from 'src/helpers/handleError';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkUserExists(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: id,
        },
        include: {
          comments: true,
          discussions: true,
          opinions: true,
        },
      });

      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error: unknown) {
      handleError(error, 'Error checking if user exists');
    }
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = bcrypt.hashSync(createUserDto.password, 10);
      return await this.prisma.user.create({
        data: {
          fullname: createUserDto.fullname,
          email: createUserDto.email,
          password: hashedPassword,
        },
      });
    } catch (error: unknown) {
      handleError(error, 'Error creating user');
    }
  }

  async findAll(
    per_page: string,
    page: string,
  ): Promise<PaginatedResponse<User> | null> {
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
      handleError(error, 'Error getting users');
    }
  }

  async findOne(id: string): Promise<User | null> {
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
      handleError(error, 'Error getting user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
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
          role: Role[updateUserDto.role] ?? undefined,
        },
      });

      return user;
    } catch (error: unknown) {
      handleError(error, 'Error updating user');
    }
  }

  async remove(id: string): Promise<User | null> {
    try {
      await this.checkUserExists(id);
      const user = await this.prisma.user.delete({
        where: {
          id: id,
        },
      });
      return user;
    } catch (error: unknown) {
      handleError(error, 'Error deleting user');
    }
  }
}
