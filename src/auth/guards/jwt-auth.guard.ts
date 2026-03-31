import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Adicione lógica personalizada aqui se necessário antes da validação padrão
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Se houver erro ou o usuário não existir (token inválido)
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido ou ausente');
    }
    return user;
  }
}