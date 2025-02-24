import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';

import { UpdateUserDto } from './dto/update-user.dto';

import { User } from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { PaginatedResponse, Role } from 'src/types/types';
import { PrepareResponse } from 'libs/common/src/helpers/prepareResponse';
import { handleError } from 'libs/common/src/helpers/handleError';
import { JWTPayload } from 'src/auth/interfaces';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { convertToSecondsUtil } from 'libs/common/src/utils';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async findOne(idOrEmail: string, isReset = false): Promise<User | null> {
    try {
      if (isReset) {
        await this.cacheManager.del(idOrEmail);
      }
      const user = await this.cacheManager.get<User>(idOrEmail);
      if (!user) {
        const newUser = await this.prisma.user.findFirst({
          where: {
            OR: [
              {
                id: idOrEmail,
              },
              {
                email: idOrEmail,
              },
            ],
          },
          include: {
            comments: true,
            discussions: true,
            opinions: true,
          },
        });

        if (!newUser) {
          throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
        }

        await this.cacheManager.set(
          idOrEmail,
          newUser,
          convertToSecondsUtil(this.configService.get('JWT_EXP')),
        );
        await this.cacheManager.get<User>(idOrEmail);

        return newUser;
      }
      return user;
    } catch (error: unknown) {
      handleError(error, 'Error getting if user exists');
    }
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      let checking = false;
      await this.findOne(createUserDto.email)
        .then(() => (checking = false))
        .catch(() => (checking = true));
      if (!checking) {
        throw new HttpException(
          `User with this email already exists`,
          HttpStatus.CONFLICT,
        );
      }

      const hashedPassword = createUserDto.password
        ? bcrypt.hashSync(createUserDto.password, 10)
        : undefined;

      const newUser = await this.prisma.user.create({
        data: {
          fullname: createUserDto.fullname,
          email: createUserDto.email,
          password: hashedPassword,
          provider: createUserDto.provider ?? undefined,
          isVerified: createUserDto.provider ? true : undefined,
          verificationToken: createUserDto.provider ? '' : undefined,
        },
      });

      if (!newUser.isVerified) {
        await this.mailService.verify(
          newUser.email,
          newUser.fullname,
          this.configService.get('FRONT_URL') +
            `/verify/${newUser.verificationToken}`,
        );
      }

      Promise.all([
        await this.cacheManager.set(newUser.email, newUser),
        await this.cacheManager.set(newUser.id, newUser),
      ]);

      return newUser;
    } catch (error: unknown) {
      handleError(error, 'Error creating user');
    }
  }

  async findAll(
    per_page: string,
    page: string,
    order: 'asc' | 'desc',
    sortBy: 'title' | 'date',
    nameOrEmail: string,
  ): Promise<PaginatedResponse<User> | null> {
    try {
      const users = await this.prisma.user.findMany({
        skip: Number(per_page) * (Number(page) - 1),
        take: Number(per_page),
        where: {
          OR: [
            { fullname: { contains: nameOrEmail, mode: 'insensitive' } },
            { email: { contains: nameOrEmail, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          [sortBy === 'title' ? 'fullname' : 'createdAt']: order,
        },
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

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: JWTPayload,
  ): Promise<User | null> {
    try {
      await this.findOne(id);
      if (id !== currentUser.id && currentUser.role !== Role.ADMIN) {
        throw new HttpException(
          `You don't have permission to update this user`,
          HttpStatus.FORBIDDEN,
        );
      }
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
          isBlocked: updateUserDto.isBlocked ?? undefined,
          isVerified: updateUserDto.isVerified ?? undefined,
          verificationToken: updateUserDto.isVerified ? '' : undefined,
        },
      });
      Promise.all([
        await this.cacheManager.set(id, user),
        await this.cacheManager.set(currentUser.email, user),
      ]);

      return user;
    } catch (error: unknown) {
      handleError(error, 'Error updating user');
    }
  }

  async remove(id: string, currentUser: JWTPayload): Promise<User | null> {
    try {
      await this.findOne(id);
      if (id !== currentUser.id && currentUser.role !== Role.ADMIN) {
        throw new HttpException(
          `You don't have permission to delete this user`,
          HttpStatus.FORBIDDEN,
        );
      }
      Promise.all([
        await this.cacheManager.del(id),
        await this.cacheManager.del(currentUser.email),
      ]);

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
