import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey', // Use uma variável de ambiente
    });
  }

  async validate(payload: any) {
    // O objeto retornado aqui será inserido no req.user
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role,
      uf: payload.uf,
      regional: payload.regional 
    };
  }
}