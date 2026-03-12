import { Injectable } from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll() {
    try {
      return await this.usuarioRepository.find();
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  }

  async findOne(cedula: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { cedula: cedula },
      });
      if (!usuario) {
        console.warn(`Usuario con ${cedula} no encontrado`);
        return null;
      }
      return usuario;
    } catch (error) {
      console.error('Error fetching usuario:', error);
    }
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { userId: id },
      });
      if (!usuario) {
        console.warn(`Usuario con ID ${id} no encontrado para actualización`);
        return null;
      }
      await this.usuarioRepository.merge(usuario, updateUsuarioDto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  }

  async updateByCedula(cedula: string, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { cedula: cedula },
      });
      if (!usuario) {
        console.warn(`Usuario con cédula ${cedula} no encontrado para actualización`);
        return null;
      }
      await this.usuarioRepository.merge(usuario, updateUsuarioDto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      console.error('Error actualizando usuario por cédula:', error);
    }
  }

  async remove(id: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { userId: id },
      });
      
      if (!usuario) {
        console.warn(`Usuario con ID ${id} no encontrado para eliminación`);
        return null;
      }
      usuario.isActive = false;
      await this.usuarioRepository.save(usuario);
      return { message: `Usuario con ID ${id} eliminado correctamente` };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  }
}
