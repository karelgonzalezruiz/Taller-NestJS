import { Injectable, NotFoundException } from '@nestjs/common';
import type { Foto } from './entities/foto.entity.js';

@Injectable()
export class FotosService {
    private fotos: Foto[] = [
        { id: 1, titulo: 'Foto 1', descripcion: 'Descripción de la foto 1', calificacion: 5 },
        { id: 2, titulo: 'Foto 2', descripcion: 'Descripción de la foto 2', calificacion: 4 },
        { id: 3, titulo: 'Foto 3', descripcion: 'Descripción de la foto 3', calificacion: 3 },
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
        const maxId = this.fotos.reduce((max, foto) => Math.max(max, foto.id), 0);
        const nuevaFoto: Foto = {
            ...datos,
            id: maxId + 1,
        };
        this.fotos.push(nuevaFoto);
        return nuevaFoto;
    }

    update(id: number, datos: Partial<Omit<Foto, 'id'>>): Foto {
        const foto = this.findOne(id);
        const { id: _ignorado, ...cambios } = datos as Partial<Foto>;
        Object.assign(foto, cambios);
        return foto;
    }

    remove(id: number): void {
        const foto = this.findOne(id);
        const indice = this.fotos.indexOf(foto);
        this.fotos.splice(indice, 1);
    }
}
