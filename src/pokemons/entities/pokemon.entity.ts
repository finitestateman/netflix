import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import { PokemonType } from '../types/pokemon.types';

@Entity({
    comment: 'Pokemon',
    schema: 'pokemon',
    //   orderBy: {
    //     id: 'DESC',
    //   },
})
@Unique(['name'])
export class Pokemon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'int',
        comment: 'National No. of Pokemon',
        name: 'national_no',
        unique: true,
        // primaryKeyConstraintName: 'pokemon_national_no_pk',
    })
    nationalNo: number;

    @Column({
        unique: true,
    })
    name: string;

    @Column({
        array: true,
        type: 'enum',
        enum: PokemonType,
        enumName: 'pokemon_type',
    })
    types: PokemonType[];

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: {
            // Converts feet to meters (stored in mm in DB)
            to: (value: number) => (value / 3.28084) * 1000,
            // Converts mm to feet for API response
            from: (value: number) => (value / 1000) * 3.28084,
        },
    })
    height: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: {
            // Converts pounds to kilograms (stored in grams in DB)
            to: (value: number) => (value / 2.20462) * 1000,
            // Converts grams to pounds for API response
            from: (value: number) => (value / 1000) * 2.20462,
        },
    })
    weight: number;

    @Column({ comment: 'Species of Pokemon' })
    species: string;

    @Column({
        comment: 'Official description of Pokemon',
    })
    description: string;

    @VersionColumn()
    version: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
