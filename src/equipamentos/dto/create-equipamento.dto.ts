import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumberString,
  IsDateString,
} from 'class-validator';

export class CreateEquipamentoDto {
  // ── Obrigatórios ────────────────────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  codigo!: string; // Nº Série do Cilindro (extintor) ou Nº Série/Patrimônio (demais)

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsNotEmpty()
  uf!: string;

  // ── Descrição ────────────────────────────────────────────────────────────────
  @IsString()
  @IsOptional()
  nome?: string; // Nome / Descrição informada pelo usuário

  // ── Vínculo com ponto ────────────────────────────────────────────────────────
  @IsUUID()
  @IsOptional()
  pontoId?: string;

  // ── Campos específicos do Extintor ───────────────────────────────────────────
  @IsString()
  @IsOptional()
  extintorClasse?: string; // ABC, BC, AB, A, D, K ou valor manual

  @IsNumberString()
  @IsOptional()
  extintorCarga?: string; // kg — recebido como string, convertido no service

  @IsString()
  @IsOptional()
  agente?: string; // Pó ABC, CO₂, Água etc. (também usado por demais tipos)

  @IsString()
  @IsOptional()
  serieInmetro?: string; // Nº do Selo INMETRO

  @IsString()
  @IsOptional()
  serieCilindro?: string; // Nº de Série do Cilindro (gravado no corpo metálico)

  @IsDateString()
  @IsOptional()
  proximaRecarga?: string; // Validade da Recarga (ISO date string)

  // ── Campos legados / demais tipos ────────────────────────────────────────────
  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  capacidade?: string;

  @IsDateString()
  @IsOptional()
  dataFabricacao?: string;

  @IsDateString()
  @IsOptional()
  ultimaRecarga?: string;

  @IsDateString()
  @IsOptional()
  ultimaInspecao?: string;

  @IsDateString()
  @IsOptional()
  proximaInspecao?: string;
}