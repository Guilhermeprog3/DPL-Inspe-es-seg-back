import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreatePontoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  uf!: string;

  @IsString()
  @IsNotEmpty()
  regional!: string;

  @IsString()
  @IsNotEmpty()
  base!: string;

  @IsString()
  @IsNotEmpty()
  qrCode!: string;

  /**
   * ID do equipamento a ser vinculado no momento da criação.
   * O equipamento precisa estar sem ponto vinculado (pontoInstalacao === null).
   * Se omitido ou null, o ponto é criado vazio.
   */
  @IsUUID()
  @IsOptional()
  equipamentoAtualId?: string | null;
}