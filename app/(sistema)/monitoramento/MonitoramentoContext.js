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

  // 🔥 Cruzar dados (ESTA É A MÁGICA)
  const estacoesComDados = useMemo(() => {

    return estacoes.map((estacao) => {

      const medicao = ultimasMedicoes.find(
        (m) => m.estacao_id === estacao.id
      )

      const situacao = calcularSituacao(estacao, medicao)

      const percentual =
        medicao && estacao.nivel_transbordo
          ? (medicao.nivel / estacao.nivel_transbordo) * 100
          : 0

      return {
        ...estacao,
        medicao,
        situacao,
        percentual
      }

    })

  }, [estacoes, ultimasMedicoes])

  // 🔥 Dados da estação selecionada já prontos
  const estacaoAtual = useMemo(() => {
    if (!estacaoSelecionada) return null

    return estacoesComDados.find(
      (e) => e.id === estacaoSelecionada.id
    )
  }, [estacaoSelecionada, estacoesComDados])

  return (
    <MonitoramentoContext.Provider
      value={{

        // 🔥 LISTA COMPLETA PRO MAPA
        estacoes: estacoesComDados,

        // 🔥 SELEÇÃO
        estacaoSelecionada,
        setEstacaoSelecionada,

        // 🔥 DADOS PRONTOS PRO PAINEL
        estacaoAtual

      }}
    >
      {children}
    </MonitoramentoContext.Provider>
  )
}

export function useMonitoramento() {
  return useContext(MonitoramentoContext)
}
