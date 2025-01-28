import { IsNotEmpty, IsString, IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { PokemonType } from '../types/pokemon.types';

export class CreatePokemonDto {
    @IsNumber()
    @IsNotEmpty()
    nationalNo: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsEnum(PokemonType, { each: true })
    @IsNotEmpty()
    types: PokemonType[];

    @IsNumber()
    @IsOptional()
    height?: number;

    @IsNumber()
    @IsOptional()
    weight?: number;

    @IsString()
    @IsNotEmpty()
    species: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
