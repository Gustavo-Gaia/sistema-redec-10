/* app/(sistema)/monitoramento/componentes/TabelaHistorico.js */
"use client"

import { useEffect, useState } from "react"
import { calcularSituacao } from "../utils/calcularSituacao"
import { Clock, AlertCircle } from "lucide-react"

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
    if (!estacao?.id) return

    async function carregar() {
      setLoading(true)
      try {
        const res = await fetch(`/api/historico-estacao?id=${estacao.id}&periodo=${periodo}`)
        const json = await res.json()
        
        // ✅ Aplicando o limite de 200 registros para garantir performance
        // Assumindo que o JSON vem ordenado do mais recente para o mais antigo
        setDados(json.slice(0, 200))
      } catch (err) {
        console.error("Erro ao carregar histórico:", err)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [estacao?.id, periodo])

  if (!estacao) return null

  return (
    <div className="relative animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
              Registros Recentes
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Exibindo até 200 leituras
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
          {Object.keys(filtros).map((f) => (
            <button
              key={f}
              onClick={() => setPeriodo(f)}
              className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${
                periodo === f 
                  ? 'bg-white shadow-md text-blue-600' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {filtros[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          
          {dados.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b border-slate-100">
                <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  <th className="px-6 py-4">Data e Hora</th>
                  <th className="px-6 py-4 text-right">Nível do Rio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dados.map((m, i) => {
                  const dataObj = new Date(m.data_hora)
                  const nivel = parseFloat(m.nivel) || 0
                  const situacao = calcularSituacao(estacao, m)

                  return (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-8 rounded-full ${situacao?.cor?.replace('bg-', 'bg-opacity-50 bg-') || 'bg-slate-200'}`} />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">
                              {dataObj.toLocaleDateString("pt-BR")}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`
                          inline-block px-3 py-1.5 rounded-xl text-white text-[11px] font-black
                          ${situacao?.cor || 'bg-slate-400'} shadow-sm
                        `}>
                          {nivel.toFixed(2)}m
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : !loading && (
            <div className="p-12 text-center flex flex-col items-center gap-2">
              <AlertCircle className="text-slate-300" size={32} />
              <p className="text-sm font-bold text-slate-400 uppercase">Nenhum dado encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-3xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Sincronizando...</span>
          </div>
        </div>
      )}
    </div>
  )
}
