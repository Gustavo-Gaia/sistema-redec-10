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

  const [ocorrencias, setOcorrencias] = useState([])
  const [loading, setLoading] = useState(true)

  const [ano, setAno] = useState("todos")
  const [mes, setMes] = useState("todos")
  const [municipio, setMunicipio] = useState("todos")

  /*
  ==========================
  CARREGAMENTO INICIAL
  ==========================
  */

  useEffect(() => {

    async function carregar() {

      setLoading(true)

      const { data, error } = await supabase
        .from("ocorrencias_incendio")
        .select("*")
        .order("data_ocorrencia", {
          ascending: false
        })

      if (error) {
        console.error(error)
      }

      setOcorrencias(data || [])
      setLoading(false)
    }

    carregar()

  }, [])

  /*
  ==========================
  FILTROS REATIVOS
  ==========================
  */

  const ocorrenciasFiltradas = useMemo(() => {

    return ocorrencias.filter((o) => {

      const anoOk =
        ano === "todos" ||
        o.ano === Number(ano)

      const mesOk =
        mes === "todos" ||
        o.mes === Number(mes)

      const municipioOk =
        municipio === "todos" ||
        o.municipio_nome === municipio

      return (
        anoOk &&
        mesOk &&
        municipioOk
      )
    })

  }, [
    ocorrencias,
    ano,
    mes,
    municipio
  ])

  /*
  ==========================
  LISTAS DOS FILTROS
  ==========================
  */

  const anosDisponiveis = useMemo(() => {

    return [
      ...new Set(
        ocorrencias.map(
          o => o.ano
        )
      )
    ].sort()

  }, [ocorrencias])

  const municipiosDisponiveis = useMemo(() => {

    return [
      ...new Set(
        ocorrencias.map(
          o => o.municipio_nome
        )
      )
    ].sort()

  }, [ocorrencias])

  return (
    <Context.Provider
      value={{
        loading,

        ocorrencias,
        ocorrenciasFiltradas,

        ano,
        setAno,

        mes,
        setMes,

        municipio,
        setMunicipio,

        anosDisponiveis,
        municipiosDisponiveis
      }}
    >
      {children}
    </Context.Provider>
  )
}

export function useMonitoramentoIncendios() {

  const context = useContext(Context)

  if (!context) {
    throw new Error(
      "useMonitoramentoIncendios deve ser usado dentro do provider."
    )
  }

  return context
}
