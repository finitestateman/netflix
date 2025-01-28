import { Injectable } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContainedBy, ArrayContains, ArrayOverlap, InsertResult, IsNull, Not, Repository } from 'typeorm';
import { PokemonType } from './types/pokemon.types';

@Injectable()
export class PokemonsService {
    constructor(
        @InjectRepository(Pokemon)
        private pokemonRepo: Repository<Pokemon>,
    ) {}

    createAll(createPokemonDtos: CreatePokemonDto[]) {
        return this.pokemonRepo.save(createPokemonDtos, {
            chunk: 2,
            transaction: false,
        });
    }

    create(createPokemonDto: CreatePokemonDto) {
        return this.pokemonRepo.save(createPokemonDto);
    }

    createFastAll(createPokemonDtos: CreatePokemonDto[]) {
        return this.pokemonRepo.insert(createPokemonDtos);
    }

    async createFast(createPokemonDto: CreatePokemonDto) {
        const result: InsertResult = await this.pokemonRepo.insert(createPokemonDto);
        return result;
    }

    findAll() {
        return this.pokemonRepo.find();
    }

    async findWithQueryBuilder(id: number, types: PokemonType | PokemonType[]) {
        const qb = this.pokemonRepo.createQueryBuilder('pokemon').where('id = :id', { id });

        // types가 배열인 경우와 단일 값인 경우를 처리
        if (Array.isArray(types)) {
            qb.andWhere('pokemon.types @> :types', { types });
        } else {
            qb.andWhere(':type = ANY(pokemon.types)', { type: types });
        }

        const [query, parameters] = qb.getQueryAndParameters();
        console.log(query);
        console.log(parameters);
        const pokemons = await qb.getMany();

        return pokemons;
    }

    findArrayContains(types: string | string[]) {
        // 문자열 배열을 PokemonType enum 배열로 변환
        const enumTypes = Array.isArray(types)
            ? types.map((type) => {
                  const enumValue = PokemonType[type as keyof typeof PokemonType];
                  if (enumValue === undefined) {
                      throw new Error(`Invalid PokemonType: ${type}`);
                  }
                  return enumValue;
              })
            : (() => {
                  const enumValue = PokemonType[types as keyof typeof PokemonType];
                  if (enumValue === undefined) {
                      throw new Error(`Invalid PokemonType: ${types}`);
                  }
                  return [enumValue];
              })();

        return this.pokemonRepo.find({
            where: { types: ArrayContains(enumTypes) },
        });
    }

    findArrayContainedBy(types: string | string[]) {
        // 문자열 배열을 PokemonType enum 배열로 변환
        const enumTypes = Array.isArray(types)
            ? types.map((type) => {
                  const enumValue = PokemonType[type as keyof typeof PokemonType];
                  if (enumValue === undefined) {
                      throw new Error(`Invalid PokemonType: ${type}`);
                  }
                  return enumValue;
              })
            : [PokemonType[types as keyof typeof PokemonType]];
        return this.pokemonRepo.find({
            where: { types: ArrayContainedBy(enumTypes) },
        });
    }

    findArrayOverlap(types: string | string[]) {
        // 문자열 배열을 PokemonType enum 배열로 변환
        const enumTypes = Array.isArray(types)
            ? types.map((type) => {
                  const enumValue = PokemonType[type as keyof typeof PokemonType];
                  if (enumValue === undefined) {
                      throw new Error(`Invalid PokemonType: ${type}`);
                  }
                  return enumValue;
              })
            : [PokemonType[types as keyof typeof PokemonType]];
        return this.pokemonRepo.find({
            where: { types: ArrayOverlap(enumTypes) },
        });
    }

    findOne(id: string) {
        return this.pokemonRepo.findOne({
            where: { id },
            comment: 'find one pokemon',
        });
    }

    upsert(id: string, updatePokemonDto: UpdatePokemonDto) {
        return this.pokemonRepo.upsert(updatePokemonDto, {
            conflictPaths: ['name'],
            skipUpdateIfNoValuesChanged: true,
        });
    }

    update(id: string, updatePokemonDto: UpdatePokemonDto) {
        return this.pokemonRepo.update(id, updatePokemonDto);
    }

    removeAll() {
        return this.pokemonRepo.clear();
    }

    remove(id: string) {
        return this.pokemonRepo.delete(id);
    }

    softDelete(id: string) {
        return this.pokemonRepo.softDelete(id);
    }

    restore(id: string) {
        return this.pokemonRepo.restore(id);
    }

    async hardRemove(id: string) {
        const pokemon = await this.pokemonRepo.findOne({ where: { id } });
        const result = await this.pokemonRepo.remove(pokemon);
        return result;
    }

    async softRemove(id: string) {
        const pokemon = await this.pokemonRepo.findOne({ where: { id } });
        return this.pokemonRepo.softRemove(pokemon);
    }

    async recover(id: string) {
        const pokemon = await this.pokemonRepo.findOne({
            where: { id, deletedAt: Not(IsNull()) },
        });
        return this.pokemonRepo.recover(pokemon);
    }
}
