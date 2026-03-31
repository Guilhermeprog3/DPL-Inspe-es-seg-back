import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string, loginUf: string, loginRegional: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // 1. Validar Senha
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Senha incorreta');

    // 2. Validar Restrição de Localidade (Regra solicitada)
    if (user.uf !== loginUf || user.regional !== loginRegional) {
      throw new UnauthorizedException('Você não tem permissão para acessar esta Regional/UF');
    }

    // 3. Gerar Token com a Role
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role, 
      uf: user.uf, 
      regional: user.regional 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        nome: user.nome,
        role: user.role
      }
    };
  }
}