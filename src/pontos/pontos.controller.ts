import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PontosService } from './pontos.service';
import { CreatePontoDto } from './dto/create-ponto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pontos')
@UseGuards(JwtAuthGuard)
export class PontosController {
  constructor(private readonly pontosService: PontosService) {}

  @Post()
  create(@Body() createPontoDto: CreatePontoDto) {
    return this.pontosService.create(createPontoDto);
  }

  @Get()
  findAll() {
    return this.pontosService.findAll();
  }

  @Get('qrcode/:code')
  findByQrCode(@Param('code') code: string) {
    return this.pontosService.findByQrCode(code);
  }

  @Get('hierarquia')
  getHierarchy() {
    return this.pontosService.getLocationsHierarchy();
  }
}