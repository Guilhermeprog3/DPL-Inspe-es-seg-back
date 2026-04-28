import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EquipamentosService } from './equipamentos.service';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('equipamentos')
@UseGuards(JwtAuthGuard)
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Post()
  create(@Body() dto: CreateEquipamentoDto) {
    return this.equipamentosService.create(dto);
  }

  @Get()
  findAll() {
    return this.equipamentosService.findAll();
  }

  @Get('disponiveis')
  findDisponiveis() {
    return this.equipamentosService.findDisponiveis();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipamentosService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.equipamentosService.remove(id);
  }
}