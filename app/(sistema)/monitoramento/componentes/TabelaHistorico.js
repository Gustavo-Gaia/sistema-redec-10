/* app/(sistema)/monitoramento/componentes/TabelaHistorico.js */
"use client"

import { useEffect, useState } from "react"
import { calcularSituacao } from "../utils/calcularSituacao"
import { Clock, Calendar, Download } from "lucide-react"

export default function TabelaHistorico({ estacao }) {
  const [dados, setDados] = useState([])
  const [periodo, setPeriodo] = useState("24h")
  const [loading, setLoading] = useState(false)

  const filtros = {
    "24h": { label: "24h" },
    "7d": { label: "7 dias" },
    "30d": { label: "30 dias" },
    "total": { label: "Tudo" }
  }

  useEffect(() => {
    if (!estacao) return
    async function carregar() {
      setLoading(true)
      try {
        const res = await fetch(`/api/historico-estacao?id=${estacao.id}&periodo=${periodo}`)
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
    <div className="relative">
      
      {/* HEADER DA LISTA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Registros Recentes</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leituras automáticas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* SELETOR DE PERÍODO COMPACTO */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {Object.keys(filtros).map((f) => (
              <button
                key={f}
                onClick={() => setPeriodo(f)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${
                  periodo === f ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {filtros[f].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTAINER DA TABELA COM SCROLL SUAVE */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/30">
        <div className="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100">
              <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                <th className="px-6 py-4">Data / Hora</th>
                <th className="px-6 py-4 text-right font-black">Nível Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.map((m, i) => {
                const dataObj = new Date(m.data_hora);
                const nivel = Number(m.nivel);
                const situacao = calcularSituacao(estacao, m);

                return (
                  <tr key={i} className="group hover:bg-white transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {dataObj.toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`text-xs font-black ${situacao?.cor?.replace('bg-', 'text-') || 'text-slate-600'}`}>
                          {nivel.toFixed(2)} m
                        </span>
                        {/* INDICADOR VISUAL DISCRETO */}
                        <div className={`w-2 h-2 rounded-full ${situacao?.cor || 'bg-slate-300'} shadow-sm animate-pulse`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-2xl">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {dados.length === 0 && !loading && (
        <div className="py-20 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma medição encontrada</p>
        </div>
      )}
    </div>
  )
}
