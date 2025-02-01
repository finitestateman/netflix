import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class UserService {
    public constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    public create(createUserDto: CreateUserDto): Promise<User> {
        return this.userRepository.save(createUserDto);
    }

    public findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    public async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('존재하지 않는 사용자입니다');
        }

        return user;
    }

    public async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('존재하지 않는 사용자입니다');
        }

        await this.userRepository.update(id, updateUserDto);

        return this.userRepository.findOne({ where: { id } });
    }

    public remove(id: number): Promise<DeleteResult> {
        return this.userRepository.delete(id);
    }
}
