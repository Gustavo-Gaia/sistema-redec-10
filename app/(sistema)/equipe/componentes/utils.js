/* app/(sistema)/equipe/componentes/utils.js */

import { format, isWithinInterval, parseISO, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Normaliza uma string de data para evitar problemas de fuso horário (UTC vs Local)
 */
const safeParse = (dateString) => {
  // Adiciona o horário para garantir que o parseISO trate como tempo local do navegador
  return parseISO(`${dateString}T00:00:00`);
};

/**
 * Calcula o status de prontidão de um militar com base nos afastamentos
 */
export function calcularStatus(afastamentos = []) {
  const hoje = startOfDay(new Date());

  // Busca se existe algum afastamento que englobe a data de hoje
  const afastamentoAtual = afastamentos.find(afast => {
    const inicio = safeParse(afast.data_inicio);
    const fim = safeParse(afast.data_fim);
    return isWithinInterval(hoje, { start: inicio, end: fim });
  });

  if (afastamentoAtual) {
    // O retorno é sempre no dia seguinte ao fim do afastamento
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
 * Ordena a equipe por hierarquia (Coord, Sub, Adm) e depois por ordem manual
 */
export function ordenarEquipe(militares, config) {
  if (!militares) return [];

  return [...militares].sort((a, b) => {
    // 1. Coordenador sempre no topo
    if (a.id === config?.coordenador_id) return -1;
    if (b.id === config?.coordenador_id) return 1;

    // 2. Subcoordenador em segundo
    if (a.id === config?.subcoordenador_id) return -1;
    if (b.id === config?.subcoordenador_id) return 1;

    // 3. Critério de 'ordem' definido no cadastro
    if (a.ordem !== b.ordem) {
      return (a.ordem || 0) - (b.ordem || 0);
    }

    // 4. Desempate por Nome de Guerra (Alfabeto)
    return a.nome_guerra.localeCompare(b.nome_guerra);
  });
}
