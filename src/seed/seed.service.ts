import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  async runSeed() {
    const { data } = await this.axios.get<PokeResponse>(
      `http://pokeapi.co/api/v2/pokemon?limit=650`,
    );

    const pokenons = data.results.map(({ name, url }) => {
      const no = +url.split('/')[6];
      return {
        no,
        name,
      };
    });

    return pokenons;
  }
}
