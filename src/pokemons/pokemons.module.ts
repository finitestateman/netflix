import { Module } from '@nestjs/common';
import { PokemonsService } from './pokemons.service';
import { PokemonsController } from './pokemons.controller';
import { Pokemon } from './entities/pokemon.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    controllers: [PokemonsController],
    providers: [PokemonsService],
    imports: [TypeOrmModule.forFeature([Pokemon])],
})
export class PokemonsModule {}
