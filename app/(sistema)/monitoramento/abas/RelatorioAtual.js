/* app/(sistema)/monitoramento/abas/RelatorioAtual.js */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import ModalRelatorioAtual from "../componentes/modais/ModalRelatorioAtual"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function RelatorioAtual() {

  const [estacoes, setEstacoes] = useState([])
  const [dados, setDados] = useState({})
  const [horaRef, setHoraRef] = useState("08")

  const [idsSelecionados, setIdsSelecionados] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)

  const [loadingAna, setLoadingAna] = useState(false)
  const [loadingInea, setLoadingInea] = useState(false)

  useEffect(() => {
    carregarEstacoes()
  }, [])

  async function carregarEstacoes() {
    const { data } = await supabase
      .from("estacoes")
      .select(`
        id,
        municipio,
        fonte,
        nivel_transbordo,
        rios(nome)
      `)
      .eq("ativo", true)
      .order('id', { ascending: true })

    setEstacoes(data || [])
    setIdsSelecionados(data?.map(e => e.id) || [])
  }

  // ============================
  // SELEÇÃO
  // ============================

  function toggleSelecao(id) {
    setIdsSelecionados(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  function toggleTodos() {
    if (idsSelecionados.length === estacoes.length) {
      setIdsSelecionados([])
    } else {
      setIdsSelecionados(estacoes.map(e => e.id))
    }
  }

  // ============================
  // BUSCAS
  // ============================

  async function buscarANA() {
    if (!horaRef) return
    setLoadingAna(true)

    try {
      const resp = await fetch(`/api/ana-relatorio?hora=${horaRef}`)
      const json = await resp.json()

      setDados(prev => ({
        ...prev,
        ...json
      }))

    } catch {
      alert("Erro ao buscar ANA")
    }

    setLoadingAna(false)
  }

  async function buscarINEA() {
    if (!horaRef) return
    setLoadingInea(true)

    try {
      const resp = await fetch(`/api/inea-relatorio?hora=${horaRef}`)
      const json = await resp.json()

      setDados(prev => ({
        ...prev,
        ...json
      }))

    } catch {
      alert("Erro ao buscar INEA")
    }

    setLoadingInea(false)
  }

  // ============================
  // VISUALIZAR RELATÓRIO
  // ============================

  function visualizarRelatorio() {
    if (idsSelecionados.length === 0) {
      alert("Selecione pelo menos uma estação")
      return
    }

    setMostrarModal(true)
  }

  // ============================
  // CABEÇALHO
  // ============================

  function gerarCabecalho() {
    const h = parseInt(horaRef)

    const calc = (sub) => {
      let v = h - sub
      if (v < 0) v += 24
      return String(v).padStart(2, "0") + "h"
    }

    return [calc(12), calc(8), calc(4), calc(0)]
  }

  const cabecalho = gerarCabecalho()

  // ============================
  // RENDER
  // ============================

  return (
    <div className="space-y-6">

      {/* CABEÇALHO */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">

        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Relatório Atual
          </h3>
        </div>

        <div className="flex items-center gap-2">

          <input
            type="number"
            min="0"
            max="23"
            value={horaRef}
            onChange={(e) => setHoraRef(e.target.value)}
            className="w-20 border rounded-lg p-2 text-center font-bold text-lg"
          />

          <button onClick={buscarANA} disabled={loadingAna}
            className="bg-green-600 text-white px-3 py-2 rounded-lg">
            {loadingAna ? "..." : "Buscar ANA"}
          </button>

          <button onClick={buscarINEA} disabled={loadingInea}
            className="bg-purple-600 text-white px-3 py-2 rounded-lg">
            {loadingInea ? "..." : "Buscar INEA"}
          </button>

          <div className="w-px h-8 bg-slate-200 mx-1" />

          <button onClick={visualizarRelatorio}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold">
            Visualizar Relatório ({idsSelecionados.length})
          </button>

        </div>
      </div>

      {/* TABELA */}
      <div className="overflow-auto border rounded-xl bg-white shadow-sm">

        <table className="w-full text-sm">

          <thead className="bg-slate-50 border-b text-slate-600 uppercase text-[11px] font-bold">
            <tr>

              <th className="p-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={idsSelecionados.length === estacoes.length}
                  onChange={toggleTodos}
                />
              </th>

              <th className="p-3 text-left">Rio</th>
              <th className="p-3 text-left">Município</th>

              {cabecalho.map((h, i) => (
                <th key={i} className="p-3 text-center">{h}</th>
              ))}

            </tr>
          </thead>

          <tbody>

            {estacoes.map((estacao) => {

              const d = dados[estacao.id] || {}

              const colunas = [d.h12, d.h8, d.h4, d.ref]

              return (
                <tr key={estacao.id} className="border-b">

                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={idsSelecionados.includes(estacao.id)}
                      onChange={() => toggleSelecao(estacao.id)}
                    />
                  </td>

                  <td className="p-3 font-semibold">
                    {estacao.rios?.nome}
                  </td>

                  <td className="p-3">
                    {estacao.municipio}
                  </td>

                  {colunas.map((c, i) => (
                    <td key={i} className="text-center">
                      {c?.nivel ? c.nivel.toFixed(2) : "—"}
                    </td>
                  ))}

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {mostrarModal && (
        <ModalRelatorioAtual
          dados={dados}
          estacoes={estacoes.filter(e => idsSelecionados.includes(e.id))}
          cabecalho={cabecalho}
          onClose={() => setMostrarModal(false)}
        />
      )}

    </div>
  )
}
