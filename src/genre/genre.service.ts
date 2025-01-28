import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenreService {
    public constructor(
        @InjectRepository(Genre)
        private readonly genreRepository: Repository<Genre>,
    ) {}

    public create(createGenreDto: CreateGenreDto): Promise<Genre> {
        return this.genreRepository.save(createGenreDto);
    }

    public findAll(): Promise<Genre[]> {
        return this.genreRepository.find();
    }

    public findOne(id: number): Promise<Genre> {
        return this.genreRepository.findOne({ where: { id } });
    }

    public async update(id: number, updateGenreDto: UpdateGenreDto): Promise<Genre> {
        const genre = await this.genreRepository.findOne({ where: { id } });

        if (!genre) {
            throw new NotFoundException('존재하지 않는 장르입니다!');
        }

        const result = await this.genreRepository.update({ id }, { ...updateGenreDto });

        if (result.affected === 0) {
            throw new NotFoundException('장르 정보가 갱신되지 않았습니다!');
        }

        return this.genreRepository.findOne({ where: { id } });
    }

    public async remove(id: number): Promise<number> {
        const genre = await this.genreRepository.findOne({ where: { id } });

        if (!genre) {
            throw new NotFoundException('존재하지 않는 장르입니다!');
        }

        const result = await this.genreRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException('장르 정보가 삭제되지 않았습니다!');
        }

        return id;
    }
}
