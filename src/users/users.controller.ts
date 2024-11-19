import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { User } from '@prisma/client';
import { PaginatedResponse } from 'src/types/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<User | null> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
  ): Promise<PaginatedResponse<User> | null> {
    return this.usersService.findAll(per_page, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    isValidUUID(id);
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    isValidUUID(id);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<User | null> {
    isValidUUID(id);
    return this.usersService.remove(id);
  }
}
