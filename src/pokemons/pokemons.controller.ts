import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PokemonsService } from './pokemons.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonType } from './types/pokemon.types';

@Controller(['pokemons', 'pokemon'])
export class PokemonsController {
    constructor(private readonly pokemonsService: PokemonsService) {}

    @Post('all')
    createAll(@Body() createPokemonDtos: CreatePokemonDto[]) {
        return this.pokemonsService.createAll(createPokemonDtos);
    }

    @Post()
    create(@Body() createPokemonDto: CreatePokemonDto) {
        return this.pokemonsService.create(createPokemonDto);
    }

    @Post('fast/all')
    createFastAll(@Body() createPokemonDtos: CreatePokemonDto[]) {
        return this.pokemonsService.createFastAll(createPokemonDtos);
    }

    @Post('fast')
    createFast(@Body() createPokemonDto: CreatePokemonDto) {
        return this.pokemonsService.createFast(createPokemonDto);
    }

    @Get()
    findAll() {
        return this.pokemonsService.findAll();
    }

    @Get('qb')
    findWithQueryBuilder(@Query('id') id: number, @Query('types') types: string | string[]) {
        const enumTypes = Array.isArray(types)
            ? types.map((type) => {
                  const enumEntry = Object.entries(PokemonType).find(([_, value]) => value === type);
                  if (!enumEntry) {
                      throw new Error(`Invalid PokemonType: ${type}`);
                  }
                  return type as PokemonType;
              })
            : (() => {
                  const enumEntry = Object.entries(PokemonType).find(([_, value]) => value === types);
                  if (!enumEntry) {
                      throw new Error(`Invalid PokemonType: ${types}`);
                  }
                  return types as PokemonType;
              })();
        return this.pokemonsService.findWithQueryBuilder(id, enumTypes);
    }

    @Get('contains')
    findArrayContains(@Query('types') types: string | string[]) {
        return this.pokemonsService.findArrayContains(types);
    }

    @Get('contained')
    findArrayContainedBy(@Query('types') types: string | string[]) {
        return this.pokemonsService.findArrayContainedBy(types);
    }

    @Get('overlap')
    findArrayOverlaps(@Query('types') types: string | string[]) {
        return this.pokemonsService.findArrayOverlap(types);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.pokemonsService.findOne(id);
    }

    @Patch('upsert/:id')
    upsert(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
        return this.pokemonsService.upsert(id, updatePokemonDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
        return this.pokemonsService.update(id, updatePokemonDto);
    }

    @Delete('all')
    removeAll() {
        return this.pokemonsService.removeAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.pokemonsService.remove(id);
    }

    @Delete('soft/:id')
    softDelete(@Param('id') id: string) {
        return this.pokemonsService.softDelete(id);
    }

    @Patch('restore/:id')
    restore(@Param('id') id: string) {
        return this.pokemonsService.restore(id);
    }

    @Delete('remove/:id')
    hardRemove(@Param('id') id: string) {
        return this.pokemonsService.hardRemove(id);
    }

    @Delete('softRemove/:id')
    softRemove(@Param('id') id: string) {
        return this.pokemonsService.softRemove(id);
    }

    @Patch('recover/:id')
    recover(@Param('id') id: string) {
        return this.pokemonsService.recover(id);
    }
}
