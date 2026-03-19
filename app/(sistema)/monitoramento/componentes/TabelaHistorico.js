/* app/(sistema)/monitoramento/componentes/TabelaHistorico.js */
"use client"

import { useEffect, useState } from "react"
import { calcularSituacao } from "../utils/calcularSituacao"

export default function TabelaHistorico({ estacao }) {

  const [dados, setDados] = useState([])
  const [periodo, setPeriodo] = useState("24h")
  const [loading, setLoading] = useState(false)

  const filtros = {
    "24h": { label: "Últimas 24h" },
    "7d": { label: "Últimos 7 dias" },
    "30d": { label: "Últimos 30 dias" },
    "total": { label: "Histórico completo" }
  }

  useEffect(() => {
    if (!estacao) return

    async function carregar() {
      setLoading(true)

      try {
        const res = await fetch(
          `/api/historico-estacao?id=${estacao.id}&periodo=${periodo}`
        )

        const json = await res.json()
        setDados(json)

      } catch (err) {
        console.error("Erro ao carregar histórico:", err)
      } finally {
        setLoading(false)
      }
    }

    carregar()

  }, [estacao, periodo])

  if (!estacao) return null

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-300/20 p-6 md:p-8 relative">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
            Histórico de Medições
          </h3>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
            {filtros[periodo].label}
          </p>
        </div>

        {/* BOTÕES */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {Object.keys(filtros).map((f) => (
            <button
              key={f}
              onClick={() => setPeriodo(f)}
              className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all 
                ${periodo === f
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-[2rem] z-10">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* TABELA */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">

        <table className="w-full text-sm border-separate border-spacing-y-3">

          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-left text-slate-600 uppercase text-[11px] font-black tracking-widest">
              <th className="px-6 py-2">Data</th>
              <th className="px-6 py-2">Hora</th>
              <th className="px-6 py-2 text-right">Nível</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((m, i) => {

              const dataObj = new Date(m.data_hora)

              // 🔥 Compatível com view (sem abaixo_regua)
              const nivel = Number(m.nivel)

              // Só calcula situação se tiver dados completos
              const situacao = m.abaixo_regua !== undefined
                ? calcularSituacao(estacao, m)
                : null

              return (
                <tr key={i} className="group transition-all">

                  <td className="px-6 py-5 bg-slate-50 group-hover:bg-slate-100 rounded-l-2xl font-bold text-slate-800 border-y border-l border-slate-100">
                    {dataObj.toLocaleDateString("pt-BR")}
                  </td>

                  <td className="px-6 py-5 bg-slate-50 group-hover:bg-slate-100 font-bold text-slate-600 border-y border-slate-100">
                    {periodo === "24h"
                      ? dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>

                  <td className="px-6 py-5 bg-slate-50 group-hover:bg-slate-100 rounded-r-2xl text-right border-y border-r border-slate-100">

                    <span className={`
                      inline-block px-5 py-2 rounded-xl text-white text-[12px] font-semibold uppercase tracking-wide shadow-md
                      ${situacao ? situacao.cor : "bg-slate-400"}
                    `}>
                      {isNaN(nivel)
                        ? "—"
                        : `${nivel.toFixed(2)} m`}
                    </span>

                  </td>

                </tr>
              )
            })}
          </tbody>

        </table>

      </div>
    </div>
  )
}
