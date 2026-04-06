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

  // ── POST /pontos ─────────────────────────────────────────────────────────
  @Post()
  create(@Body() dto: CreatePontoDto) {
    return this.pontosService.create(dto);
  }

  // ── GET /pontos ──────────────────────────────────────────────────────────
  @Get()
  findAll() {
    return this.pontosService.findAll();
  }

  // ⚠️ Rotas estáticas SEMPRE antes de /:id — senão o NestJS trata a string
  //    literal como valor do parâmetro :id e retorna 404 ou dados errados.

  // ── GET /pontos/hierarquia ───────────────────────────────────────────────
  @Get('hierarquia')
  getHierarchy() {
    return this.pontosService.getLocationsHierarchy();
  }

  // ── GET /pontos/qrcode/:code ─────────────────────────────────────────────
  @Get('qrcode/:code')
  findByQrCode(@Param('code') code: string) {
    return this.pontosService.findByQrCode(code);
  }

  // ── GET /pontos/:id ──────────────────────────────────────────────────────
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pontosService.findOne(id);
  }

  // ── PATCH /pontos/:id ────────────────────────────────────────────────────
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePontoDto) {
    return this.pontosService.update(id, dto);
  }

  // ── DELETE /pontos/:id ───────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.pontosService.remove(id);
  }
}