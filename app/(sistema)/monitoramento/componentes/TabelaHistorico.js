/* app/(sistema)/monitoramento/componentes/TabelaHistorico.js */
"use client"

import { useEffect, useState } from "react"
import { calcularSituacao } from "../utils/calcularSituacao"

export default function TabelaHistorico({ estacao }) {
  const [dados, setDados] = useState([])

  useEffect(() => {
    if (!estacao) return
    async function carregar() {
      const res = await fetch(`/api/historico-estacao?id=${estacao.id}&limit=10`)
      const json = await res.json()
      setDados(json)
    }
    carregar()
  }, [estacao])

  if (!estacao) return null

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Histórico de Medições</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos 10 registros</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Hora</th>
              <th className="px-4 py-2 text-right">Nível Atual</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((m, i) => {
              const situacao = calcularSituacao(estacao, m)
              const dataObj = new Date(m.data_hora)

              return (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 bg-slate-50/50 group-hover:bg-white rounded-l-2xl font-bold text-slate-600 border-y border-l border-transparent group-hover:border-slate-100">
                    {dataObj.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-4 bg-slate-50/50 group-hover:bg-white font-medium text-slate-400 border-y border-transparent group-hover:border-slate-100">
                    {dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-4 bg-slate-50/50 group-hover:bg-white rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-slate-100">
                    <span className={`inline-block px-4 py-1.5 rounded-xl text-white text-[11px] font-black uppercase tracking-tight shadow-sm ${situacao.cor}`}>
                      {m.abaixo_regua ? "A/R" : `${Number(m.nivel).toFixed(2)} m`}
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
