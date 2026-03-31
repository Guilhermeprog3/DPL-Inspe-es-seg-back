import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    // O body deve conter: email, password, uf, regional
    // Note que no seu frontend você enviou 'password' como 'senha'
    const { email, password, uf, regional } = body;
    
    if (!email || !password || !uf || !regional) {
      throw new UnauthorizedException('Dados de login incompletos');
    }

    return this.authService.login(email, password, uf, regional.toUpperCase());
  }
}