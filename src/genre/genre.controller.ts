import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ClassSerializerInterceptor,
    UseInterceptors,
    ParseIntPipe,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from './entities/genre.entity';

@Controller('genre')
@UseInterceptors(ClassSerializerInterceptor)
export class GenreController {
    public constructor(private readonly genreService: GenreService) {}

    @Post()
    public create(@Body() createGenreDto: CreateGenreDto): Promise<Genre> {
        return this.genreService.create(createGenreDto);
    }

    @Get()
    public findAll(): Promise<Genre[]> {
        return this.genreService.findAll();
    }

    @Get(':id')
    public findOne(@Param('id', ParseIntPipe) id: number): Promise<Genre> {
        return this.genreService.findOne(id);
    }

    // 장르는 entity에 name밖에 없기 때문에 name patch가 곧 name put이므로 @Put()으로 바꾸는 게 더 어울린다
    @Patch(':id')
    public update(@Param('id', ParseIntPipe) id: number, @Body() updateGenreDto: UpdateGenreDto): Promise<Genre> {
        return this.genreService.update(id, updateGenreDto);
    }

    @Delete(':id')
    public remove(@Param('id', ParseIntPipe) id: number): Promise<number> {
        return this.genreService.remove(id);
    }
}
