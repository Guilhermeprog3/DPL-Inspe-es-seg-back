import {
  Controller, Get, Post, Patch, Delete, Param,
  Body, Req, UseInterceptors, UploadedFiles,
  Query, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MedidasService } from './medidas.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medidas')
@UseGuards(JwtAuthGuard)
export class MedidasController {
  constructor(private readonly medidasService: MedidasService) {}

  @Get()
  findAll(
    @Query('userId')    userId: string,
    @Query('role')      role: string,
    @Query('uf')        userUf: string,
    @Query('regional')  userRegional: string,
    @Query('ufs')       ufsParam?: string,
    @Query('regionais') regionaisParam?: string,
  ) {
    if (!userId) throw new BadRequestException('userId é obrigatório');

    const ufs       = ufsParam       ? ufsParam.split(',').map(s => s.trim()).filter(Boolean)       : [];
    const regionais = regionaisParam ? regionaisParam.split(',').map(s => s.trim()).filter(Boolean) : [];

    return this.medidasService.findAll(userId, role ?? '', userUf ?? '', userRegional ?? '', ufs, regionais);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medidasService.findOne(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  create(
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!dto.userId) throw new BadRequestException('userId é obrigatório');
    return this.medidasService.create(dto, dto.userId, files ?? []);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 10))
  update(
    @Param('id') id: string,
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!dto.userId) throw new BadRequestException('userId é obrigatório');
    return this.medidasService.update(id, dto, dto.userId, files ?? []);
  }

  // ── DELETE /medidas/:id ──────────────────────────────────────────────────────
  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId é obrigatório');
    return this.medidasService.remove(id, userId);
  }
}

// 343