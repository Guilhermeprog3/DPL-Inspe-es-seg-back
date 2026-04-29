import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  sobrenome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['PI', 'MA'])
  uf: string;

  @IsString()
  @IsNotEmpty()
  regional: string;


@IsIn(['admin', 'inspetor', 'agente_cobli', 'sesmt', 'coordenador', 'gerente', 'supervisor']) 
role: string;
}