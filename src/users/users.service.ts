import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({ data: createUserDto });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error creating user: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred while creating user');
      }
    }
  }

  findAll() {
    const data = this.prisma.user.findMany();
    if (!data) {
      return {
        message: 'No users found',
      };
    }
    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
