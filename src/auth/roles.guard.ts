import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ROLES_KEY } from './roles.decorator';
import { Rol } from '../usuario/entities/usuario.entity';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero ejecutar validación JWT (Auth)
    const authResult = (await super.canActivate(context)) as boolean;
    if (!authResult) return false;

    // Leer roles requeridos desde metadata
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos => permitir
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      return false;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRole = requiredRoles.includes(user.rol);
    
    if (!hasRole) {
      throw new ForbiddenException('No tienes permisos suficientes para acceder a este recurso');
    }

    return true;
  }
}