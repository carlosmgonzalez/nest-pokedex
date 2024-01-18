import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error, `Can't create Pokemon`);
    }
  }

  async findAll() {
    const pokemons = await this.pokemonModel.find();
    return pokemons;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    // Para evaluar por numero de pokemon, aca verificamos que sea un numero
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    // Para evaluar por mongoId
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    // Acá ya sabemos que no es un mongoId y que tampoco es un numero, por lo tanto debe ser el nombre del pokemon
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLowerCase().trim(),
      });
    }

    // Acá evaluamos si sigue sin exitir un pokemon, por lo tanto no hubo resultados y mandamos un not found
    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no ${term} not found`,
      );

    // Retornamos el pokemon que encontramos
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term);
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      }
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error, 'Pokemon could not be updated');
    }
  }

  async remove(id: string) {
    const pokemon = await this.pokemonModel.findById(id);
    if (!pokemon) {
      throw new BadRequestException(`Pokemon with id '${id}' not found`);
    }
    await pokemon.deleteOne();
    return pokemon;
  }

  private handleExceptions(error: any, message: string) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `There is already a pokemon with ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(`${message}, check server logs `);
  }
}
