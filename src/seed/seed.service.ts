import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async runSeed() {
    const data = await this.http.get<PokeResponse>(
      `http://pokeapi.co/api/v2/pokemon?limit=650`,
    );

    await this.pokemonModel.deleteMany({});

    const pokemons = data.results.map(({ name, url }) => {
      const no = +url.split('/')[6];
      return {
        name,
        no,
      };
    });

    const response = await this.pokemonModel.insertMany(pokemons);

    return response;
  }
}
