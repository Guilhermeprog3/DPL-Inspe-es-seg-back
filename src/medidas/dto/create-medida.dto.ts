import {
  IsNotEmpty, IsString, IsIn, IsOptional, IsInt, Min,
  IsArray, ArrayMaxSize,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMedidaDto {
  @IsString() @IsNotEmpty()
  colaborador: string;

  @IsString() @IsNotEmpty()
  matricula: string;

  @IsString() @IsNotEmpty()
  supervisor: string;

  @IsString() @IsNotEmpty()
  nomeSupervisor: string;

  @IsIn(['SEGURANÇA', 'ADMINISTRATIVA'])
  tipo: string;

  @IsString() @IsNotEmpty()
  medida: string;

  @IsIn(['LEVE', 'MÉDIA', 'GRAVE', 'GRAVÍSSIMA', 'TOLERÂNCIA ZERO'])
  gravidade: string;

  @IsString() @IsNotEmpty()
  classificacao: string;

  @IsString() @IsNotEmpty()
  ocorrencia: string;

  @IsString()
  @IsNotEmpty({ message: 'A origem é obrigatória' })
  @IsIn(['ESS', 'CLICK', 'NMC', 'MULTA DE TRÂNSITO', 'GESTÃO DE GENTE'], {
    message: 'Origem inválida',
  })
  origem: string;

  @IsOptional()
  @IsInt({ message: 'Os dias de suspensão devem ser um número inteiro' })
  @Min(1, { message: 'A suspensão deve ser de no mínimo 1 dia' })
  diasSuspensao?: number;

  /**
   * Array de números de inspeção CLICK vinculados a esta medida.
   * O frontend envia como JSON string no FormData; o Transform cuida do parse.
   * Máximo de 20 inspeções por medida.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20, { message: 'Máximo de 20 inspeções vinculadas' })
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).map((s: string) => s.trim()).filter(Boolean);
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.map(String).map((s: string) => s.trim()).filter(Boolean)
        : [String(value).trim()].filter(Boolean);
    } catch {
      return [String(value).trim()].filter(Boolean);
    }
  })
  numerosInspecao?: string[];

  // ── Preenchidos automaticamente pelo service (não vêm do body) ───────────
  @IsOptional() @IsString()
  uf?: string;

  @IsOptional() @IsString()
  regional?: string;
}