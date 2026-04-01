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
  const [dados, setDados] = useState({}) // Aqui guardaremos os 4 níveis por estação
  const [horaRef, setHoraRef] = useState("08") // Padrão 08h
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarEstacoes()
  }, [])

  async function carregarEstacoes() {
    const { data } = await supabase
      .from("estacoes")
      .select(`id, municipio, fonte, rios(nome)`)
      .eq("ativo", true)
      .eq("fonte", "ANA") // Foco inicial nas automáticas da ANA
      .order('id', { ascending: true })
    setEstacoes(data || [])
  }

  async function buscarRelatorioANA() {
    setLoading(true)
    try {
      // Passamos a hora de referência para a nova API que vamos criar
      const resp = await fetch(`/api/ana-relatorio?hora=${horaRef}`)
      const json = await resp.json()
      
      // O JSON virá estruturado com os 4 horários
      setDados(json) 
    } catch {
      alert("Erro ao buscar relatório da ANA")
    } finally {
      setLoading(false)
    }
  }

  // Função para calcular os rótulos das colunas baseada na horaRef
  const getColunas = () => {
    const h = parseInt(horaRef)
    const subtrair = (val) => {
        let res = h - val
        return res < 0 ? res + 24 : res
    }
    return [
        { label: `${h}h`, key: "ref" },
        { label: `${subtrair(4)}h`, key: "h4" },
        { label: `${subtrair(8)}h`, key: "h8" },
        { label: `${subtrair(12)}h`, key: "h12" }
    ]
  }

  return (
    <div className="space-y-6">
      {/* BARRA DE COMANDO */}
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 text-white">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Hora de Referência</p>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    min="0" max="23"
                    value={horaRef}
                    onChange={(e) => setHoraRef(e.target.value.padStart(2, '0'))}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 w-20 text-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="text-xl font-bold text-slate-500">:00</span>
            </div>
          </div>
          
          <div className="h-12 w-px bg-slate-700" />

          <div>
            <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Intervalo Padrão</p>
            <p className="text-xl font-bold text-slate-200 uppercase">4 em 4 Horas</p>
          </div>
        </div>

        <button 
          onClick={buscarRelatorioANA}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-8 py-4 rounded-xl font-black uppercase text-sm transition-all shadow-xl shadow-blue-900/20"
        >
          {loading ? "⌛ Processando..." : "🚀 Gerar Relatório ANA"}
        </button>
      </div>

      {/* TABELA DE RESULTADOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-left font-black text-slate-400 uppercase text-[10px]">Rio / Estação</th>
              <th className="p-4 text-left font-black text-slate-400 uppercase text-[10px]">Município</th>
              {getColunas().map(col => (
                <th key={col.key} className="p-4 text-center font-black text-blue-600 uppercase text-sm bg-blue-50/50">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {estacoes.map(estacao => (
              <tr key={estacao.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-700">
                  {estacao.rios?.nome}
                </td>
                <td className="p-4 text-slate-500">
                  {estacao.municipio}
                </td>
                {/* Colunas de Dados vindos da API */}
                {getColunas().map(col => {
                    const valor = dados[estacao.id]?.[col.key]
                    return (
                        <td key={col.key} className="p-4 text-center">
                            {valor ? (
                                <span className="text-lg font-black text-slate-800">{valor.toFixed(2)}m</span>
                            ) : (
                                <span className="text-slate-300 italic">--</span>
                            )}
                        </td>
                    )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
