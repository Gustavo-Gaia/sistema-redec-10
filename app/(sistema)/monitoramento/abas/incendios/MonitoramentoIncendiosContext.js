/* app/(sistema)/monitoramento/abas/incendios/MonitoramentoIncendiosContext.js */

"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"

import { supabase } from "@/lib/supabase"

const MonitoramentoIncendiosContext = createContext()

export function MonitoramentoIncendiosProvider({ children }) {

  const [loading, setLoading] = useState(true)

  const [ocorrencias, setOcorrencias] = useState([])

  // filtros
  const [anoSelecionado, setAnoSelecionado] = useState(2025)
  const [mesSelecionado, setMesSelecionado] = useState("todos")
  const [municipioSelecionado, setMunicipioSelecionado] = useState("todos")

  // futuro:
  const [visualizacao, setVisualizacao] = useState("pontos")
  // pontos | cluster | heatmap

  /*
  ============================================
  CARREGAMENTO DAS OCORRÊNCIAS
  ============================================
  */

  useEffect(() => {
    carregarOcorrencias()
  }, [])

  async function carregarOcorrencias() {
    try {

      setLoading(true)

      const { data, error } = await supabase
        .from("ocorrencias_incendio")
        .select("*")
        .order("data_ocorrencia", {
          ascending: false
        })

      if (error) throw error

      setOcorrencias(data || [])

    } catch (error) {
      console.error(
        "Erro ao carregar ocorrências:",
        error
      )
    } finally {
      setLoading(false)
    }
  }

  /*
  ============================================
  FILTROS REATIVOS
  ============================================
  */

  const ocorrenciasFiltradas = useMemo(() => {

    return ocorrencias.filter((o) => {

      const anoOk =
        anoSelecionado === "todos" ||
        o.ano === anoSelecionado

      const mesOk =
        mesSelecionado === "todos" ||
        o.mes === mesSelecionado

      const municipioOk =
        municipioSelecionado === "todos" ||
        o.municipio_nome === municipioSelecionado

      return (
        anoOk &&
        mesOk &&
        municipioOk
      )
    })

  }, [
    ocorrencias,
    anoSelecionado,
    mesSelecionado,
    municipioSelecionado
  ])

  /*
  ============================================
  LISTA DE MUNICÍPIOS
  ============================================
  */

  const municipiosDisponiveis = useMemo(() => {

    return [
      ...new Set(
        ocorrencias.map(
          o => o.municipio_nome
        )
      )
    ].sort()

  }, [ocorrencias])

  /*
  ============================================
  ESTATÍSTICAS
  ============================================
  */

  const totalOcorrencias =
    ocorrenciasFiltradas.length

  const horarioPredominante = useMemo(() => {

    if (!ocorrenciasFiltradas.length)
      return null

    const horas = {}

    ocorrenciasFiltradas.forEach((o) => {
      horas[o.hora] =
        (horas[o.hora] || 0) + 1
    })

    return Object.entries(horas)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

  }, [ocorrenciasFiltradas])

  return (
    <MonitoramentoIncendiosContext.Provider
      value={{
        loading,

        ocorrencias,
        ocorrenciasFiltradas,

        anoSelecionado,
        setAnoSelecionado,

        mesSelecionado,
        setMesSelecionado,

        municipioSelecionado,
        setMunicipioSelecionado,

        visualizacao,
        setVisualizacao,

        municipiosDisponiveis,

        totalOcorrencias,
        horarioPredominante,

        carregarOcorrencias
      }}
    >
      {children}
    </MonitoramentoIncendiosContext.Provider>
  )
}

export function useMonitoramentoIncendios() {

  const context = useContext(
    MonitoramentoIncendiosContext
  )

  if (!context) {
    throw new Error(
      "useMonitoramentoIncendios deve ser usado dentro do Provider"
    )
  }

  return context
}
