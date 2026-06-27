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

const Context = createContext()

export function MonitoramentoIncendiosProvider({
  children
}) {

  /*
  ========================================
  ESTADOS PRINCIPAIS
  ========================================
  */

  const [loading, setLoading] = useState(true)

  const [ocorrencias, setOcorrencias] = useState([])

  /*
  ========================================
  FILTROS
  ========================================
  */

  const [filtros, setFiltros] = useState({
    ano: 0,
    mes: 0,
    municipio: "",
    visualizacao: "pontos"
  })

  /*
  ========================================
  CARREGAMENTO INICIAL
  ========================================
  */

  useEffect(() => {

    async function carregarOcorrencias() {

      setLoading(true)

      const { data, error } = await supabase
        .from("ocorrencias_incendio")
        .select("*")
        .order(
          "data_ocorrencia",
          {
            ascending: false
          }
        )

      if (error) {
        console.error(
          "Erro ao carregar ocorrências:",
          error
        )
      }

      setOcorrencias(data || [])

      setLoading(false)
    }

    carregarOcorrencias()

  }, [])

  /*
  ========================================
  FILTROS REATIVOS
  ========================================
  */

  const ocorrenciasFiltradas = useMemo(() => {

    return ocorrencias.filter((o) => {

      const anoOk =
        filtros.ano === 0 ||
        o.ano === filtros.ano

      const mesOk =
        filtros.mes === 0 ||
        o.mes === filtros.mes

      const municipioOk =
        filtros.municipio === "" ||
        o.municipio_nome === filtros.municipio

      return (
        anoOk &&
        mesOk &&
        municipioOk
      )
    })

  }, [
    ocorrencias,
    filtros
  ])

  /*
  ========================================
  LISTAS DOS FILTROS
  ========================================
  */

  const anosDisponiveis = useMemo(() => {

    return [
      ...new Set(
        ocorrencias
          .map(o => o.ano)
          .filter(Boolean)
      )
    ]
    .sort((a, b) => b - a)

  }, [ocorrencias])

  const municipiosDisponiveis = useMemo(() => {

    return [
      ...new Set(
        ocorrencias
          .map(o => o.municipio_nome)
          .filter(Boolean)
      )
    ]
    .sort()

  }, [ocorrencias])

  /*
  ========================================
  ESTATÍSTICAS
  ========================================
  */

  const estatisticas = useMemo(() => {

    const total =
      ocorrenciasFiltradas.length

    const rankingMunicipios = {}

    ocorrenciasFiltradas.forEach((o) => {

      rankingMunicipios[
        o.municipio_nome
      ] =
        (rankingMunicipios[
          o.municipio_nome
        ] || 0) + 1

    })

    const municipioLider =
      Object.entries(
        rankingMunicipios
      )
      .sort(
        (a, b) => b[1] - a[1]
      )[0]

    const ocorrenciasPorMes = {}

    ocorrenciasFiltradas.forEach((o) => {

      ocorrenciasPorMes[o.mes] =
        (ocorrenciasPorMes[o.mes] || 0) + 1

    })

    const mesCritico =
      Object.entries(
        ocorrenciasPorMes
      )
      .sort(
        (a, b) => b[1] - a[1]
      )[0]

    const ocorrenciasPorHora = {}

    ocorrenciasFiltradas.forEach((o) => {

      ocorrenciasPorHora[o.hora] =
        (ocorrenciasPorHora[o.hora] || 0) + 1

    })

    const horarioPredominante =
      Object.entries(
        ocorrenciasPorHora
      )
      .sort(
        (a, b) => b[1] - a[1]
      )[0]

    return {
      total,

      municipioLider:
        municipioLider || null,

      mesCritico:
        mesCritico || null,

      horarioPredominante:
        horarioPredominante || null
    }

  }, [
    ocorrenciasFiltradas
  ])

  /*
  ========================================
  RANKING MUNICÍPIOS
  ========================================
  */

  const rankingMunicipios = useMemo(() => {

    const ranking = {}

    ocorrenciasFiltradas.forEach((o) => {

      ranking[o.municipio_nome] =
        (ranking[o.municipio_nome] || 0) + 1

    })

    return Object.entries(ranking)
      .map(([nome, total]) => ({
        nome,
        total
      }))
      .sort(
        (a, b) =>
          b.total - a.total
      )

  }, [
    ocorrenciasFiltradas
  ])

  /*
  ========================================
  EXPORTAÇÃO DO CONTEXTO
  ========================================
  */

  return (
    <Context.Provider
      value={{

        loading,

        ocorrencias,

        ocorrenciasFiltradas,

        filtros,
        setFiltros,

        anosDisponiveis,
        municipiosDisponiveis,

        estatisticas,

        rankingMunicipios
      }}
    >
      {children}
    </Context.Provider>
  )
}

export function useMonitoramentoIncendios() {

  const context =
    useContext(Context)

  if (!context) {
    throw new Error(
      "useMonitoramentoIncendios deve ser usado dentro do provider."
    )
  }

  return context
}
