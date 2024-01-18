import { join } from 'path'; // Paquete propio de node
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRoot('mongodb://root:123456@localhost:27017'),
    PokemonModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
