/* app/(sistema)/monitoramento/utils/calcularSituacao.js */

export function calcularSituacao(estacao, medicao) {
  if (!medicao) {
    return {
      status: "sem_dado",
      cor: "bg-[#868e96]", // Sem cota (cinza neutro oficial)
      texto: "Sem dados"
    }
  }

  if (medicao.abaixo_regua) {
    return {
      status: "abaixo_regua",
      cor: "bg-[#495057]", // Abaixo da régua (cinza escuro oficial)
      texto: "Abaixo da régua"
    }
  }

  if (!estacao?.nivel_transbordo) {
    return {
      status: "sem_cota",
      cor: "bg-[#868e96]", // Sem cota (cinza neutro oficial)
      texto: "Sem cota"
    }
  }

  const percentual = (medicao.nivel / estacao.nivel_transbordo) * 100

  // 🟢 NORMAL: abaixo de 85%
  if (percentual < 85) {
    return {
      status: "normal",
      cor: "bg-[#2b8a3e]",
      texto: "Normal"
    }
  }

  // 🟡 ALERTA: entre 85% e 99%
  if (percentual < 100) {
    return {
      status: "alerta",
      cor: "bg-[#f59f00]",
      texto: "Alerta"
    }
  }

  // 🔴 TRANSBORDO: entre 100% e 120%
  if (percentual <= 120) {
    return {
      status: "transbordo",
      cor: "bg-[#e03131]",
      texto: "Transbordo"
    }
  }

  // 🟣 EXTREMO: acima de 120%
  return {
    status: "extremo",
    cor: "bg-[#862e9c]",
    texto: "Risco Extremo"
  }
}
