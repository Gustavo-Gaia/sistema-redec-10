/* app/(sistema)/equipe/componentes/utils.js */

import { format, isWithinInterval, parseISO, addDays, startOfDay, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from "@/lib/supabase";

/**
 * Normaliza uma string de data para evitar problemas de fuso horário
 */
const safeParse = (dateString) => {
  if (!dateString) return null;
  return parseISO(`${dateString}T00:00:00`);
};

/**
 * Faz o upload da foto para o Supabase Storage
 * 🔥 PADRÃO FIXO: militar-{id}.jpg
 * ✔ evita duplicação
 * ✔ permite overwrite
 * ✔ facilita remoção
 */
export const uploadFotoMilitar = async (militarId, file) => {
  try {
    const fileName = `militar-${militarId}.jpg`;
    const filePath = fileName;

    const { error } = await supabase.storage
      .from('militares')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('militares')
      .getPublicUrl(filePath);

    // 🔥 SOLUÇÃO DO CACHE (ESSENCIAL)
    return `${publicUrl}?t=${Date.now()}`;

  } catch (error) {
    console.error('Erro no upload:', error.message);
    throw error;
  }
};

/**
 * Remove a foto do militar do storage
 */
export const removerFotoMilitar = async (militarId) => {
  try {
    const filePath = `militar-${militarId}.jpg`;

    // 1. Remove do Storage
    const { error: storageError } = await supabase.storage
      .from('militares')
      .remove([filePath]);

    if (storageError) throw storageError;

    // 2. Limpa a referência no Banco de Dados
    const { error: dbError } = await supabase
      .from('equipe')
      .update({ avatar_url: null })
      .eq('id', militarId);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Erro ao remover foto:', error.message);
    throw error;
  }
};

/**
 * Formata CPF no padrão 000.000.000-00
 */
export const formatarCPF = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '') 
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

/**
 * Formata Telefone no padrão (00) 00000-0000
 */
export const formatarTelefone = (value) => {
  if (!value) return "";
  const num = value.replace(/\D/g, ""); 
  const len = num.length;

  if (len <= 2) return `(${num}`;
  if (len <= 6) return `(${num.slice(0, 2)}) ${num.slice(2)}`;
  if (len <= 10) return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7, 11)}`;
};

/**
 * Verifica se o militar ainda pertence à unidade
 */
export function verificarSeAtivo(militar) {
  if (!militar.ativo) return false;
  
  if (militar.data_saida_redec) {
    const hoje = startOfDay(new Date());
    const dataSaida = safeParse(militar.data_saida_redec);
    if (isBefore(dataSaida, hoje)) return false;
  }
  
  return true;
}

/**
 * Calcula o status de prontidão (Verde/Amarelo)
 */
export function calcularStatus(afastamentos = []) {
  const hoje = startOfDay(new Date());

  const afastamentoAtual = afastamentos.find(afast => {
    const inicio = safeParse(afast.data_inicio);
    const fim = safeParse(afast.data_fim);
    return inicio && fim && isWithinInterval(hoje, { start: inicio, end: fim });
  });

  if (afastamentoAtual) {
    const dataRetorno = addDays(safeParse(afastamentoAtual.data_fim), 1);
    
    return {
      label: 'Afastado',
      cor: 'bg-amber-500',
      corFundo: 'bg-amber-50/50',
      border: 'border-amber-200',
      texto: 'text-amber-700',
      info: `Retorno em ${format(dataRetorno, "dd/MM", { locale: ptBR })}`,
      isAfastado: true,
      tipo: afastamentoAtual.tipo
    };
  }

  return {
    label: 'Disponível',
    cor: 'bg-green-500',
    corFundo: 'bg-green-50/50',
    border: 'border-green-200',
    texto: 'text-green-700',
    info: 'No posto',
    isAfastado: false,
    tipo: null
  };
}

/**
 * Ordena a equipe por hierarquia e ordem manual
 */
export function ordenarEquipe(militares, config) {
  if (!militares) return [];

  return [...militares].sort((a, b) => {
    if (a.id === config?.coordenador_id) return -1;
    if (b.id === config?.coordenador_id) return 1;

    if (a.id === config?.subcoordenador_id) return -1;
    if (b.id === config?.subcoordenador_id) return 1;

    if (a.ordem !== b.ordem) {
      return (a.ordem || 0) - (b.ordem || 0);
    }

    return a.nome_guerra.localeCompare(b.nome_guerra);
  });
}
