/* app/(sistema)/monitoramento/MonitoramentoContext.js */

"use client"

import { createContext, useContext, useMemo, useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { calcularSituacao } from "./utils/calcularSituacao"

const MonitoramentoContext = createContext()

// Inicializa o cliente Supabase para escuta Realtime
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export function MonitoramentoProvider({
  children,
  estacoes = [],
  ultimasMedicoes = [] // Dados iniciais vindos do servidor (SSR/RPC)
}) {
  const [estacaoSelecionada, setEstacaoSelecionada] = useState(null)

  // 🔥 ESTADO REATIVO: Onde as medições "vivas" ficam armazenadas
  const [medicoes, setMedicoes] = useState(ultimasMedicoes)

  /* ======================================== */
  /* 📡 CANAL REALTIME (Ouvindo o Robô) */
  /* ======================================== */
  useEffect(() => {
    const channel = supabase
      .channel('realtime-medicoes-redec')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT e UPDATE
          schema: 'public',
          table: 'medicoes'
        },
        (payload) => {
          const novaMedicao = payload.new

          // Segurança: ignora payloads inválidos
          if (!novaMedicao?.estacao_id) return

          setMedicoes((prev) => {
            // 1. Remove a medição antiga da estação que acabou de atualizar
            const filtradas = prev.filter(
              (m) => m.estacao_id !== novaMedicao.estacao_id
            )
            // 2. Adiciona a nova medição no topo do array
            return [novaMedicao, ...filtradas]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /* ======================================== */
  /* 🔥 MAPA DE MEDIÇÕES (Acesso O(1)) */
  /* ======================================== */
  const medicoesPorEstacao = useMemo(() => {
    const map = {}
    for (const m of medicoes) {
      map[m.estacao_id] = m
    }
    return map
  }, [medicoes])

  /* ======================================== */
  /* 🔥 ESTAÇÕES COM DADOS COMPUTADOS */
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
  /* 🔥 ESTAÇÃO SELECIONADA (Sincronizada) */
  /* ======================================== */
  const estacaoAtual = useMemo(() => {
    if (!estacaoSelecionada) return null
    return estacoesComDados.find((e) => e.id === estacaoSelecionada.id)
  }, [estacaoSelecionada, estacoesComDados])

  /* ======================================== */
  /* 🛠️ FUNÇÕES DE UX */
  /* ======================================== */
  const selecionarEstacao = (estacao) => setEstacaoSelecionada(estacao)
  const limparSelecao = () => setEstacaoSelecionada(null)

  return (
    <MonitoramentoContext.Provider
      value={{
        estacoes: estacoesComDados,
        estacaoSelecionada,
        estacaoAtual,
        selecionarEstacao,
        limparSelecao,
        medicoesPorEstacao
      }}
    >
      {children}
    </MonitoramentoContext.Provider>
  )
}

export function useMonitoramento() {
  const context = useContext(MonitoramentoContext)
  if (!context) {
    throw new Error("useMonitoramento deve ser usado dentro de um MonitoramentoProvider")
  }
  return context
}
