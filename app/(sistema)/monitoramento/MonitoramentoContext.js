/* app/(sistema)/monitoramento/MonitoramentoContext.js */

"use client"

import { createContext, useContext, useMemo, useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { calcularSituacao } from "./utils/calcularSituacao"

const MonitoramentoContext = createContext()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export function MonitoramentoProvider({
  children,
  estacoes: estacoesIniciais = [], 
  ultimasMedicoes: medicoesIniciais = []
}) {
  const [estacaoSelecionada, setEstacaoSelecionada] = useState(null)
  
  // 🔥 ESTADOS REATIVOS
  const [estacoesBase, setEstacoesBase] = useState(estacoesIniciais)
  const [medicoes, setMedicoes] = useState(medicoesIniciais)
  const [loading, setLoading] = useState(true)

  /* ======================================== */
  /* 📡 CARREGAMENTO INICIAL (Fetch do Banco) */
  /* ======================================== */
  useEffect(() => {
    async function fetchDadosIniciais() {
      try {
        setLoading(true)
        
        // 1. Busca todas as estações cadastradas
        const { data: dataEstacoes } = await supabase
          .from("estacoes")
          .select("*")
          .order('nome')

        if (dataEstacoes) setEstacoesBase(dataEstacoes)

        // 2. Busca a última medição de cada estação (usando uma query otimizada)
        // Aqui buscamos as mais recentes para popular o dashboard de imediato
        const { data: dataMedicoes } = await supabase
          .from("medicoes")
          .select("*")
          .order('data_hora', { ascending: false })

        if (dataMedicoes) {
          // Remove duplicados para manter apenas a última de cada estação no estado
          const unicas = Object.values(
            dataMedicoes.reduce((acc, m) => {
              if (!acc[m.estacao_id]) acc[m.estacao_id] = m
              return acc
            }, {})
          )
          setMedicoes(unicas)
        }
      } catch (error) {
        console.error("Erro ao carregar dados de monitoramento:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDadosIniciais()
  }, [])

  /* ======================================== */
  /* 📡 CANAL REALTIME (Atualização Viva) */
  /* ======================================== */
  useEffect(() => {
    const channel = supabase
      .channel('realtime-dashboard-redec')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medicoes' },
        (payload) => {
          const novaMedicao = payload.new
          if (!novaMedicao?.estacao_id) return

          setMedicoes((prev) => {
            // Remove a medição antiga daquela estação e adiciona a nova
            const filtradas = prev.filter(m => m.estacao_id !== novaMedicao.estacao_id)
            return [novaMedicao, ...filtradas]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  /* ======================================== */
  /* 🔥 PROCESSAMENTO DOS DADOS (Memoized) */
  /* ======================================== */
  
  // Mapeia medições por ID para acesso rápido
  const medicoesPorEstacao = useMemo(() => {
    const map = {}
    medicoes.forEach(m => { map[m.estacao_id] = m })
    return map
  }, [medicoes])

  // Une Estação + Medição + Cálculo de Situação (Alerta/Crítico)
  const estacoesComDados = useMemo(() => {
    return estacoesBase.map((estacao) => {
      const medicao = medicoesPorEstacao[estacao.id]
      const situacao = calcularSituacao(estacao, medicao)

      const percentual =
        medicao && !medicao.abaixo_regua && estacao.nivel_transbordo
          ? (medicao.nivel / estacao.nivel_transbordo) * 100
          : 0

      return {
        ...estacao,
        medicao,
        situacao,
        percentual
      }
    })
  }, [estacoesBase, medicoesPorEstacao])

  const estacaoAtual = useMemo(() => {
    if (!estacaoSelecionada) return null
    return estacoesComDados.find((e) => e.id === estacaoSelecionada.id)
  }, [estacaoSelecionada, estacoesComDados])

  /* ======================================== */
  /* 🛠️ AÇÕES EXPOSTAS */
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
        medicoesPorEstacao,
        loading
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
