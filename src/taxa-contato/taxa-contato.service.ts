import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class TaxaContatoService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async buscarColaboradoresRecentes() {
    // 1. Busca a data mais recente diretamente no Supabase
    // Nota: Use o nome exato da tabela que aparece na sua URL: TAXA_DE_CONTATO
    const { data: maxDateRow, error: dateError } = await this.supabase
      .from('TAXA_DE_CONTATO')
      .select('DATA')
      .order('DATA', { ascending: false })
      .limit(1)
      .single();

    if (dateError || !maxDateRow) return [];

    const ultimaData = maxDateRow.DATA;

    // 2. Busca todos os colaboradores daquela data
    const { data: colaboradores, error: dataError } = await this.supabase
      .from('TAXA_DE_CONTATO')
      .select('CHAVE, CHAPA, NOME, CPF, FUNCAO, EQUIPE, SUPERVISOR, DATA, FILIAL')
      .eq('DATA', ultimaData)
      .order('NOME', { ascending: true });

    if (dataError) {
      console.error('Erro Supabase:', dataError);
      throw new Error('Erro ao consultar os dados no Supabase');
    }

    return colaboradores;
  }
}