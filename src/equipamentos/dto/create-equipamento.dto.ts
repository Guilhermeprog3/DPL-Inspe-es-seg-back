import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumberString,
  IsDateString,
} from 'class-validator';

export class CreateEquipamentoDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsNotEmpty()
  uf!: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsUUID()
  @IsOptional()
  pontoId?: string;

  @IsString()
  @IsOptional()
  extintorClasse?: string;

  @IsNumberString()
  @IsOptional()
  extintorCarga?: string;

  @IsString()
  @IsOptional()
  agente?: string;

  @IsString()
  @IsOptional()
  serieInmetro?: string;

  @IsString()
  @IsOptional()
  serieCilindro?: string;

  @IsDateString()
  @IsOptional()
  proximaRecarga?: string;

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