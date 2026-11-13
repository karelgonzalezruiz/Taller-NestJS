import { Injectable, NotFoundException } from '@nestjs/common';
import type { Foto } from './entities/foto.entity.js';

@Injectable()
export class FotosService {
    private fotos: Foto[] = [
        { id: 1, titulo: 'Foto 1', descripcion: 'Descripción de la foto 1', califacion: 5 },
        { id: 2, titulo: 'Foto 2', descripcion: 'Descripción de la foto 2', califacion: 4 },
        { id: 3, titulo: 'Foto 3', descripcion: 'Descripción de la foto 3', califacion: 3 },
    ];

    findAll(): Foto[] {
        return this.fotos;
    }

    findOne(id: number): Foto {
        const foto = this.fotos.find((foto) => foto.id === id);
        if (!foto) {
           throw new NotFoundException(`Foto ${id} no encontrada`);
        }
        return foto;
    }

    create(datos: Omit<Foto, 'id'>): Foto {
        const nuevaFoto: Foto = {
            id: this.fotos.length + 1,
            ...datos,
        };
        this.fotos.push(nuevaFoto);
        return nuevaFoto;
    }
}
