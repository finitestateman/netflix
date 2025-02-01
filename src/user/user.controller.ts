import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
    public constructor(private readonly userService: UserService) {}

    @Post()
    public create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.create(createUserDto);
    }

    @Get()
    public findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    public findOne(@Param('id') id: string): Promise<User> {
        return this.userService.findOne(Number(id));
    }

    @Patch(':id')
    public update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.update(Number(id), updateUserDto);
    }

    @Delete(':id')
    public remove(@Param('id') id: string): Promise<void> {
        return this.userService.remove(Number(id));
    }
}
