/* app/(sistema)/monitoramento/componentes/TabelaHistorico.js */
"use client"

import { useEffect, useState } from "react"
import { calcularSituacao } from "../utils/calcularSituacao"
import { Calendar, History, Loader2 } from "lucide-react"

export default function TabelaHistorico({ estacao }) {
  const [dados, setDados] = useState([])
  const [periodo, setPeriodo] = useState("24h")
  const [loading, setLoading] = useState(false)

  // Configuração pragmática: limitamos os registros para manter a tabela rápida
  const filtros = {
    "24h": { limit: 24, label: "Últimas 24h" },
    "7d": { limit: 100, label: "Últimos 100 registros (7d)" },
    "30d": { limit: 300, label: "Últimos 300 registros (30d)" }
  }

  useEffect(() => {
    if (!estacao) return
    async function carregar() {
      setLoading(true)
      try {
        const limit = filtros[periodo].limit
        const res = await fetch(`/api/historico-estacao?id=${estacao.id}&limit=${limit}`)
        const json = await res.json()
        setDados(json)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [estacao, periodo])

  if (!estacao) return null

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-300/20 p-6 md:p-10 transition-all duration-500">
      
      {/* CABEÇALHO COM FILTROS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <History className="text-blue-600" size={28} />
            Histórico
          </h3>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {filtros[periodo].label} — {estacao.municipio}
          </p>
        </div>

        {/* SELETOR DE PERÍODO */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 self-end lg:self-center border border-slate-200/50">
          {Object.keys(filtros).map((f) => (
            <button
              key={f}
              onClick={() => setPeriodo(f)}
              className={`px-5 py-2 text-[11px] font-black uppercase rounded-xl transition-all 
                ${periodo === f 
                  ? 'bg-white shadow-md text-blue-600' 
                  : 'text-slate-500 hover:text-slate-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Loader Overlay para feedback visual */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <table className="w-full text-sm border-separate border-spacing-y-3">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-left text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <th className="px-6 py-4">Data / Hora</th>
                <th className="px-6 py-4 text-right">Nível Medido</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((m, i) => {
                const situacao = calcularSituacao(estacao, m)
                const dataObj = new Date(m.data_hora)

                return (
                  <tr key={i} className="group">
                    <td className="px-6 py-5 bg-slate-50 group-hover:bg-slate-100 rounded-l-[1.5rem] border-y border-l border-slate-100 group-hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow text-slate-400 group-hover:text-blue-500 transition-all">
                          <Calendar size={16} />
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="font-bold text-slate-800 text-sm">
                            {dataObj.toLocaleDateString("pt-BR")}
                          </span>
                          <span className="font-bold text-slate-400 text-[11px]">
                            {dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 bg-slate-50 group-hover:bg-slate-100 rounded-r-[1.5rem] text-right border-y border-r border-slate-100 group-hover:border-slate-200 transition-all">
                      <span className={`inline-block px-5 py-2.5 rounded-2xl text-white text-[13px] font-bold uppercase tracking-wide shadow-lg shadow-current/20 ${situacao.cor}`}>
                        {m.abaixo_regua ? "Abaixo da Régua" : `${Number(m.nivel).toFixed(2)} m`}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {dados.length === 0 && !loading && (
            <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Nenhum dado encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
