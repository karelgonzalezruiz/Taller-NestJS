import { Module } from '@nestjs/common';
import { FotosModule } from './fotos/fotos.module.js';

@Module({
  imports: [FotosModule],
})
export class AppModule {}
