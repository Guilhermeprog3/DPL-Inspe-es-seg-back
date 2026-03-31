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

  const isMatch = await bcrypt.compare(pass, user.password);
  if (!isMatch) throw new UnauthorizedException('Senha incorreta');

  if (user.uf !== loginUf || user.regional !== loginRegional) {
    throw new UnauthorizedException('Você não tem permissão para acessar esta Regional/UF');
  }

  const payload = { 
    sub: user.id, 
    email: user.email, 
    role: user.role, 
    uf: user.uf, 
    regional: user.regional 
  };

  return {
    access_token: this.jwtService.sign(payload),
    user: { // ADICIONE OS CAMPOS FALTANTES AQUI
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      uf: user.uf,
      regional: user.regional
    }
  };
}
}