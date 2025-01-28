import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DirectorService {
    public constructor(
        @InjectRepository(Director)
        private readonly directorRepository: Repository<Director>,
    ) {}

    public findAll(): Promise<Director[]> {
        return this.directorRepository.find();
    }

    public findOne(id: number): Promise<Director> {
        return this.directorRepository.findOne({
            where: { id },
        });
    }

    public create(createDirectorDto: CreateDirectorDto): Promise<Director> {
        return this.directorRepository.save(createDirectorDto);
    }

    public async update(id: number, updateDirectorDto: UpdateDirectorDto): Promise<Director> {
        const director = await this.directorRepository.findOne({
            where: { id },
        });

        if (!director) {
            throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
        }

        const result = await this.directorRepository.update(id, updateDirectorDto);

        if (result.affected === 0) {
            throw new NotFoundException('감독 정보가 갱신되지 않았습니다!');
        }

        return this.directorRepository.findOne({ where: { id } });
    }

    public async remove(id: number): Promise<number> {
        const director = await this.directorRepository.findOne({
            where: { id },
        });

        if (!director) {
            throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
        }

        const result = await this.directorRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException('감독 정보가 삭제되지 않았습니다!');
        }

        return id;
    }
}
