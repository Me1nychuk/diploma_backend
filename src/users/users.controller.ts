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
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { isValidUUID } from 'libs/common/src/helpers/isValidUUID';
import { Role, User } from '@prisma/client';
import { PaginatedResponse } from 'src/types/types';
import { CurrentUser, Public, Roles } from 'libs/common/src/decorators';
import { AuthGuard } from '@nestjs/passport';
import { UserResponse } from './responses';
import { JWTPayload } from 'src/auth/interfaces';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Public()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<UserResponse | null> {
    return new UserResponse(await this.usersService.create(createUserDto));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
  ): Promise<PaginatedResponse<UserResponse> | null> {
    const users = await this.usersService.findAll(per_page, page);
    return {
      data: users.data.map((user) => new UserResponse(user)),
      totalQuantity: users.totalQuantity,
      totalPages: users.totalPages,
      page: Number(page),
    };
  }
  @Get('/me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  me(@CurrentUser() currentUser: JWTPayload) {
    return currentUser;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    isValidUUID(id);
    return new UserResponse(await this.usersService.findOne(id));
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<UserResponse | null> {
    isValidUUID(id);
    return new UserResponse(
      await this.usersService.update(id, updateUserDto, currentUser),
    );
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JWTPayload,
  ): Promise<UserResponse | null> {
    isValidUUID(id);
    return new UserResponse(await this.usersService.remove(id, currentUser));
  }
}
