/* app/(sistema)/monitoramento/MonitoramentoContext.js */

"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { calcularSituacao } from "./utils/calcularSituacao"

const MonitoramentoContext = createContext()

export function MonitoramentoProvider({
  children,
  estacoes = [],
  ultimasMedicoes = []
}) {

  const [estacaoSelecionada, setEstacaoSelecionada] = useState(null)

  /* ======================================== */
  /* 🔥 MAPA DE MEDIÇÕES (O(1)) */
  /* ======================================== */

  const medicoesPorEstacao = useMemo(() => {
    const map = {}

    for (const m of ultimasMedicoes) {
      map[m.estacao_id] = m
    }

    return map
  }, [ultimasMedicoes])

  /* ======================================== */
  /* 🔥 ESTAÇÕES COM DADOS COMPLETOS */
  /* ======================================== */

  const estacoesComDados = useMemo(() => {

    return estacoes.map((estacao) => {

      const medicao = medicoesPorEstacao[estacao.id]

      const situacao = calcularSituacao(estacao, medicao)

      const percentual =
        medicao &&
        !medicao.abaixo_regua &&
        estacao.nivel_transbordo
          ? (medicao.nivel / estacao.nivel_transbordo) * 100
          : 0

      return {
        ...estacao,
        medicao,
        situacao,
        percentual
      }

    })

  }, [estacoes, medicoesPorEstacao])

  /* ======================================== */
  /* 🔥 ESTAÇÃO SELECIONADA COMPLETA */
  /* ======================================== */

  const estacaoAtual = useMemo(() => {
    if (!estacaoSelecionada) return null

    return estacoesComDados.find(
      (e) => e.id === estacaoSelecionada.id
    )
  }, [estacaoSelecionada, estacoesComDados])

  /* ======================================== */
  /* 🔥 FUNÇÕES AUXILIARES (UX MAPA) */
  /* ======================================== */

  const selecionarEstacao = (estacao) => {
    setEstacaoSelecionada(estacao)
  }

  const limparSelecao = () => {
    setEstacaoSelecionada(null)
  }

  /* ======================================== */
  /* PROVIDER */
  /* ======================================== */

  return (
    <MonitoramentoContext.Provider
      value={{

        // 🔥 DADOS PRINCIPAIS
        estacoes: estacoesComDados,

        // 🔥 SELEÇÃO
        estacaoSelecionada,
        estacaoAtual,
        selecionarEstacao,
        limparSelecao,

        // 🔥 EXTRA (se precisar)
        medicoesPorEstacao

      }}
    >
      {children}
    </MonitoramentoContext.Provider>
  )
}

export function useMonitoramento() {
  return useContext(MonitoramentoContext)
}
