/* app/(sistema)/boletins/componentes/utils.js */

// 1. Calcula se está vencido, no prazo ou se nem tem prazo
export function calcularStatusPrazo(prazo) {
  if (!prazo) return "sem_prazo";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataPrazo = new Date(prazo);
  dataPrazo.setHours(0, 0, 0, 0);

  const diffTempo = dataPrazo - hoje;
  const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return "vencido";
  if (diffDias <= 2) return "alerta"; // 48 horas
  return "normal";
}

// 2. Ordenação Inteligente: Estrela > Status de Prazo > Data
export function ordenarLista(lista) {
  return [...lista].sort((a, b) => {
    // 1º Estrelas (Acompanhamento Especial)
    if (a.acompanhamento_especial !== b.acompanhamento_especial) {
      return b.acompanhamento_especial ? -1 : 1;
    }

    // 2º Prioridade de Prazo
    const prioridadeStatus = {
      vencido: 3,
      alerta: 2,
      normal: 1,
      sem_prazo: 0,
    };

    const statusA = calcularStatusPrazo(a.prazo);
    const statusB = calcularStatusPrazo(b.prazo);

    if (prioridadeStatus[statusA] !== prioridadeStatus[statusB]) {
      return prioridadeStatus[statusB] - prioridadeStatus[statusA];
    }

    // 3º Mais Recentes
    return new Date(b.data_registro) - new Date(a.data_registro);
  });
}

// 3. Formatação amigável de data
export function exibirDataFormatada(dataISO) {
  if (!dataISO) return "-";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}
