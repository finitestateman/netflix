import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    public create(createUserDto: CreateUserDto): Promise<User> {
        return Promise.resolve(null);
    }

    public findAll(): Promise<User[]> {
        return Promise.resolve([] as User[]);
    }

    public findOne(id: number): Promise<User> {
        return Promise.resolve(null);
    }

    public update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        return Promise.resolve(null);
    }

    public remove(id: number): Promise<void> {
        return Promise.resolve(null);
    }
}
