import { Module } from '@nestjs/common';
import { FotosController } from './fotos.controller.js';
import { FotosService } from './fotos.service.js';

@Module({
  controllers: [FotosController],
  providers: [FotosService]
})
export class FotosModule {}
