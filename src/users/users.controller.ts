import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('per_page') per_page: string = '10',
    @Query('page') page: string = '1',
  ) {
    return this.usersService.findAll(per_page, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const newId = id.trim();

    if (!newId) {
      throw new HttpException(
        'Entered id is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    const newId = id.trim();

    if (!newId) {
      throw new HttpException(
        'Entered id is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const newId = id.trim();

    if (!newId) {
      throw new HttpException(
        'Entered id is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.remove(id);
  }
}
