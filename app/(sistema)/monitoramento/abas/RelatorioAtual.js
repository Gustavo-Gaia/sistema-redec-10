/* app/(sistema)/monitoramento/abas/RelatorioAtual.js */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function RelatorioAtual() {

  const [estacoes, setEstacoes] = useState([])
  const [dados, setDados] = useState({})
  const [horaRef, setHoraRef] = useState("08")
  const [loading, setLoading] = useState(false)

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
  }

  // ============================
  // BUSCAR DADOS ANA (RELATÓRIO)
  // ============================

  async function buscarRelatorio() {
    if (!horaRef) return

    setLoading(true)

    try {
      const resp = await fetch(`/api/ana-relatorio?hora=${horaRef}`)
      const json = await resp.json()
      setDados(json || {})
    } catch {
      alert("Erro ao buscar dados da ANA")
    }

    setLoading(false)
  }

  // ============================
  // GERAR CABEÇALHO DINÂMICO
  // ============================

  function gerarCabecalho() {
    const h = parseInt(horaRef)

    const calc = (sub) => {
      let v = h - sub
      if (v < 0) v += 24
      return String(v).padStart(2, "0") + "h"
    }

    return [
      calc(12),
      calc(8),
      calc(4),
      calc(0)
    ]
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

          <p className="text-sm text-slate-500 mt-1">
            Informe a hora de referência para gerar o histórico automático (ANA).
          </p>
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

          <button
            onClick={buscarRelatorio}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>

        </div>

      </div>

      {/* TABELA */}
      <div className="overflow-auto border rounded-xl bg-white shadow-sm">

        <table className="w-full text-sm">

          <thead className="bg-slate-50 border-b text-slate-600 uppercase text-[11px] font-bold">
            <tr>
              <th className="p-3 text-left">Rio</th>
              <th className="p-3 text-left">Município</th>

              {cabecalho.map((h, i) => (
                <th key={i} className="p-3 text-center">
                  {h}
                </th>
              ))}

            </tr>
          </thead>

          <tbody>

            {estacoes.map((estacao) => {

              const d = dados[estacao.id] || {}

              const colunas = [
                d.h12,
                d.h8,
                d.h4,
                d.ref
              ]

              return (
                <tr key={estacao.id} className="border-b hover:bg-slate-50">

                  <td className="p-3 font-semibold text-slate-700">
                    {estacao.rios?.nome}
                  </td>

                  <td className="p-3 text-slate-600">
                    {estacao.municipio}
                  </td>

                  {colunas.map((c, i) => (
                    <td key={i} className="p-3 text-center">

                      {c ? (
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-slate-800">
                            {c.nivel.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({c.hora})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}

                    </td>
                  ))}

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>

    </div>
  )
}
