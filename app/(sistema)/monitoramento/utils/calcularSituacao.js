/* app/(sistema)/monitoramento/utils/calcularSituacao.js */

export function calcularSituacao(estacao, medicao) {

  if (!medicao) {
    return {
      status: "sem_dado",
      cor: "bg-gray-400",
      texto: "Sem dados"
    }
  }

  if (medicao.abaixo_regua) {
    return {
      status: "abaixo_regua",
      cor: "bg-slate-500",
      texto: "Abaixo da régua"
    }
  }

  if (!estacao.nivel_transbordo) {
    return {
      status: "sem_cota",
      cor: "bg-gray-300",
      texto: "Sem cota de transbordo"
    }
  }

  const percentual = (medicao.nivel / estacao.nivel_transbordo) * 100

  if (percentual < 85) {
    return {
      status: "normal",
      cor: "bg-green-500",
      texto: "Normal"
    }
  }

  if (percentual < 100) {
    return {
      status: "alerta",
      cor: "bg-yellow-500",
      texto: "Alerta"
    }
  }

  if (percentual <= 120) {
    return {
      status: "transbordo",
      cor: "bg-red-500",
      texto: "Transbordo"
    }
  }

  return {
    status: "extremo",
    cor: "bg-purple-600",
    texto: "Risco Hidrológico Extremo"
  }
}
