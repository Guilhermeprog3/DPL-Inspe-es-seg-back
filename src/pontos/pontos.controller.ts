import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { PontosService } from './pontos.service';
import { CreatePontoDto } from './dto/create-ponto.dto';
import { UpdatePontoDto } from './dto/update-ponto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pontos')
@UseGuards(JwtAuthGuard)
export class PontosController {
  constructor(private readonly pontosService: PontosService) {}

  @Post()
  create(@Body() dto: CreatePontoDto) {
    return this.pontosService.create(dto);
  }

  @Get()
  findAll() {
    return this.pontosService.findAll();
  }

  @Get('hierarquia')
  getHierarchy() {
    return this.pontosService.getLocationsHierarchy();
  }

  @Get('qrcode/:code')
  findByQrCode(@Param('code') code: string) {
    return this.pontosService.findByQrCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pontosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePontoDto) {
    return this.pontosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.pontosService.remove(id);
  }
}