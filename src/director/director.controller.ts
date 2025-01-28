import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    ClassSerializerInterceptor,
    ParseIntPipe,
} from '@nestjs/common';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { Director } from './entity/director.entity';

@Controller('director')
@UseInterceptors(ClassSerializerInterceptor)
export class DirectorController {
    public constructor(private readonly directorService: DirectorService) {}

    @Get()
    public findAll(): Promise<Director[]> {
        return this.directorService.findAll();
    }

    @Get(':id')
    public findOne(@Param('id', ParseIntPipe) id: number): Promise<Director> {
        return this.directorService.findOne(id);
    }

    @Post()
    public create(@Body() createDirectorDto: CreateDirectorDto): Promise<Director> {
        return this.directorService.create(createDirectorDto);
    }

    @Patch(':id')
    public update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDirectorDto: UpdateDirectorDto,
    ): Promise<Director> {
        return this.directorService.update(id, updateDirectorDto);
    }

    @Delete(':id')
    public remove(@Param('id', ParseIntPipe) id: number): Promise<number> {
        return this.directorService.remove(id);
    }
}
