import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanNutricionalDto } from './dto/create-plan-nutricional.dto';
import { UpdatePlanNutricionalDto } from './dto/update-plan-nutricional.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanNutricional } from './entities/plan-nutricional.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class PlanNutricionalService {
  constructor(
    @InjectRepository(PlanNutricional)
    private readonly planNutricionalRepository: Repository<PlanNutricional>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createPlanNutricionalDto: CreatePlanNutricionalDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { userId: createPlanNutricionalDto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const planNutricional = this.planNutricionalRepository.create({
      linkPdf: createPlanNutricionalDto.linkPdf,
      usuario,
    });

    return await this.planNutricionalRepository.save(planNutricional);
  }

  async findAllByUsuario(usuarioId: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { userId: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const planes = await this.planNutricionalRepository.find({
      where: { usuario: { userId: usuarioId } },
      order: { createdAt: 'DESC' },
      relations: ['usuario'],
    });

    return planes;
  }

  async findOne(id: string) {
    const plan = await this.planNutricionalRepository.findOne({
      where: { planNutricionalId: id },
      relations: ['usuario'],
    });

    if (!plan) {
      throw new NotFoundException('Plan nutricional no encontrado');
    }

    return plan;
  }

  async update(id: string, updatePlanNutricionalDto: UpdatePlanNutricionalDto) {
    const plan = await this.planNutricionalRepository.findOne({
      where: { planNutricionalId: id },
    });

    if (!plan) {
      throw new NotFoundException('Plan nutricional no encontrado');
    }

    if (updatePlanNutricionalDto.linkPdf) {
      plan.linkPdf = updatePlanNutricionalDto.linkPdf;
    }

    return await this.planNutricionalRepository.save(plan);
  }

  async remove(id: string) {
    const plan = await this.planNutricionalRepository.findOne({
      where: { planNutricionalId: id },
    });

    if (!plan) {
      throw new NotFoundException('Plan nutricional no encontrado');
    }

    await this.planNutricionalRepository.remove(plan);
    return { message: 'Plan nutricional eliminado' };
  }
}
