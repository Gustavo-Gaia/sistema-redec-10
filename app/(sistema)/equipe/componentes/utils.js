/* app/(sistema)/equipe/componentes/utils.js */

import { format, isWithinInterval, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Calcula o status de prontidão de um militar com base nos afastamentos
 */
export function calcularStatus(afastamentos = []) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Busca se existe algum afastamento que englobe a data de hoje
  const afastamentoAtual = afastamentos.find(afast => {
    const inicio = parseISO(afast.data_inicio);
    const fim = parseISO(afast.data_fim);
    return isWithinInterval(hoje, { start: inicio, end: fim });
  });

  if (afastamentoAtual) {
    const dataRetorno = addDays(parseISO(afastamentoAtual.data_fim), 1);
    return {
      label: 'Afastado',
      cor: 'bg-amber-500',
      corFundo: 'bg-amber-50',
      border: 'border-amber-200',
      texto: 'text-amber-700',
      info: `Retorno em ${format(dataRetorno, "dd/MM", { locale: ptBR })}`,
      isAfastado: true
    };
  }

  return {
    label: 'Disponível',
    cor: 'bg-green-500',
    corFundo: 'bg-green-50',
    border: 'border-green-200',
    texto: 'text-green-700',
    info: 'No posto',
    isAfastado: false
  };
}

/**
 * Ordena a equipe por hierarquia (Coord, Sub, Adm) e depois por ordem manual
 */
export function ordenarEquipe(militares, config) {
  return [...militares].sort((a, b) => {
    // Coordenador sempre primeiro
    if (a.id === config?.coordenador_id) return -1;
    if (b.id === config?.coordenador_id) return 1;

    // Subcoordenador segundo
    if (a.id === config?.subcoordenador_id) return -1;
    if (b.id === config?.subcoordenador_id) return 1;

    // Restante pela ordem definida ou nome
    return (a.ordem || 0) - (b.ordem || 0);
  });
}
