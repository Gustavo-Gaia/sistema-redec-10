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
    // 1. Shadow mais "seco" e bordas bem definidas
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-300/20 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Histórico de Medições</h3>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Últimos 10 registros</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* 2. Aumentamos o espaçamento vertical para cada linha respirar */}
        <table className="w-full text-sm border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-slate-600 uppercase text-[11px] font-black tracking-widest">
              <th className="px-6 py-2">Data</th>
              <th className="px-6 py-2">Hora</th>
              <th className="px-6 py-2 text-right">Nível Atual</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((m, i) => {
              const situacao = calcularSituacao(estacao, m)
              const dataObj = new Date(m.data_hora)

              return (
                <tr key={i} className="group transition-all">
                  {/* 3. Fundo das células mais escuro (slate-100) para destacar o texto branco do badge */}
                  <td className="px-6 py-5 bg-slate-50 group-hover:bg-slate-100 rounded-l-2xl font-bold text-slate-800 border-y border-l border-slate-100 group-hover:border-slate-200 transition-colors">
                    {dataObj.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-5 bg-slate-50 group-hover:bg-slate-100 font-bold text-slate-600 border-y border-slate-100 group-hover:border-slate-200 transition-colors">
                    {dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-6 py-5 bg-slate-50 group-hover:bg-slate-100 rounded-r-2xl text-right border-y border-r border-slate-100 group-hover:border-slate-200 transition-colors">
                    {/* 4. Badge com as cores oficiais, sombra interna e fonte semibold (mais nítida que black em tamanhos pequenos) */}
                    <span className={`inline-block px-5 py-2 rounded-xl text-white text-[12px] font-semibold uppercase tracking-wide shadow-md ${situacao.cor}`}>
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
