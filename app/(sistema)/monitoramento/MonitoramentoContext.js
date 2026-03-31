/* app/(sistema)/monitoramento/MonitoramentoContext.js */

"use client"

import { createContext, useContext, useMemo, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase" // ✅ USAR CLIENT ÚNICO
import { calcularSituacao } from "./utils/calcularSituacao"

const MonitoramentoContext = createContext()

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
        
        const { data: dataEstacoes } = await supabase
          .from("estacoes")
          .select("*")
          .order('id', { ascending: true })

        if (dataEstacoes) setEstacoesBase(dataEstacoes)

        const { data: dataMedicoes } = await supabase
          .from("medicoes")
          .select("*")
          .order('data_hora', { ascending: false })

        if (dataMedicoes) {
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

    // ✅ canal único evita conflito
    const channel = supabase.channel(`realtime-dashboard-redec-${Date.now()}`)

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'medicoes' },
      (payload) => {
        const novaMedicao = payload.new
        if (!novaMedicao?.estacao_id) return

        setMedicoes((prev) => {
          const filtradas = prev.filter(
            m => m.estacao_id !== novaMedicao.estacao_id
          )
          return [novaMedicao, ...filtradas]
        })
      }
    )

    // ✅ subscribe separado (CORREÇÃO DO ERRO)
    channel.subscribe()

    // ✅ limpeza correta
    return () => {
      supabase.removeChannel(channel)
    }

  }, [])

  /* ======================================== */
  /* 🔥 PROCESSAMENTO DOS DADOS (Memoized) */
  /* ======================================== */
  
  const medicoesPorEstacao = useMemo(() => {
    const map = {}
    medicoes.forEach(m => { map[m.estacao_id] = m })
    return map
  }, [medicoes])

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
