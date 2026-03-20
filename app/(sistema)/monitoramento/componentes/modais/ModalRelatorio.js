/* app/(sistema)/monitoramento/componentes/modais/ModalRelatorio.js */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ModalRelatorio({ dadosDaTela, estacoes, onClose }) {
  const [historico, setHistorico] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarHistorico()
  }, [])

  async function buscarHistorico() {
    setLoading(true)
    const novoHistorico = {}

    for (const estacao of estacoes) {
      const { data: ultimas } = await supabase
        .from("medicoes")
        .select("nivel")
        .eq("estacao_id", estacao.id)
        .order("data", { ascending: false })
        .order("hora", { ascending: false })
        .limit(2)

      const ontem = new Date()
      ontem.setDate(ontem.getDate() - 1)
      const dataOntem = ontem.toISOString().split('T')[0]

      const { data: registroOntem } = await supabase
        .from("medicoes")
        .select("nivel")
        .eq("estacao_id", estacao.id)
        .eq("data", dataOntem)
        .limit(1)
        .maybeSingle()

      novoHistorico[estacao.id] = {
        vinteQuatroHoras: registroOntem?.nivel || "N/INF",
        antepenultima: ultimas?.[1]?.nivel || "N/INF",
        penultima: ultimas?.[0]?.nivel || "N/INF"
      }
    }
    setHistorico(novoHistorico)
    setLoading(false)
  }

  // FUNÇÕES AUXILIARES DE LÓGICA
  const obterCorNivel = (nivel, limite) => {
    if (!nivel || nivel === "N/INF" || !limite) return ""
    const percentual = (nivel / limite) * 100
    if (percentual >= 120) return "bg-purple-600 text-white print:bg-purple-600"
    if (percentual >= 100) return "bg-red-600 text-white print:bg-red-600"
    if (percentual >= 85)  return "bg-yellow-400 text-black print:bg-yellow-400"
    return ""
  }

  const obterTendencia = (atual, anterior) => {
    if (!atual || !anterior || atual === "N/INF" || anterior === "N/INF") return "—"
    if (parseFloat(atual) > parseFloat(anterior)) return "↑"
    if (parseFloat(atual) < parseFloat(anterior)) return "↓"
    return "—"
  }

  const agruparEstacoesPorRio = (lista) => {
    return lista.reduce((acc, estacao) => {
      const nomeRio = estacao.rios?.nome || "Outros"
      if (!acc[nomeRio]) acc[nomeRio] = []
      acc[nomeRio].push(estacao)
      return acc
    }, {})
  }

  const estacoesAgrupadas = agruparEstacoesPorRio(estacoes)

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999]">
        <div className="bg-white p-6 rounded-lg shadow-2xl text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="font-bold text-slate-700">Processando Informativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] p-4 overflow-auto print:p-0 print:bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: portrait; margin: 0; }
          body { background: white; }
          .no-print { display: none !important; }
          #informativo-folha { box-shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; }
        }
      `}} />

      <div className="bg-slate-200 min-h-screen w-full max-w-6xl p-8 rounded-lg relative print:p-0 print:min-h-0">
        
        {/* CONTROLES SUPERIORES */}
        <div className="flex justify-end gap-3 mb-4 no-print">
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow-md hover:bg-blue-700">Imprimir / PDF</button>
          <button onClick={onClose} className="bg-red-600 text-white px-6 py-2 rounded font-bold shadow-md hover:bg-red-700">Fechar</button>
        </div>

        {/* FOLHA DO RELATÓRIO */}
        <div id="informativo-folha" className="bg-white shadow-2xl mx-auto w-[1000px] border border-slate-300 min-h-[1414px]">
          
          {/* HEADER OFICIAL */}
          <div className="flex w-full h-24 print:h-24">
            <div className="bg-[#f37021] w-1/2 flex items-center p-8 print:bg-[#f37021]">
              <h2 className="text-white text-2xl font-black italic uppercase leading-tight">Secretaria de Estado de <br/> Defesa Civil</h2>
            </div>
            <div className="bg-[#0054a6] w-1/2 flex flex-col justify-center items-end p-8 text-white text-right print:bg-[#0054a6]">
              <span className="text-lg font-bold uppercase tracking-widest">REDEC 10 - NORTE</span>
              <span className="text-sm italic opacity-90">Informativo Diário de Monitoramento</span>
            </div>
          </div>

          <div className="p-6">
            <table className="w-full border-collapse border-[1.5px] border-black text-[10px]">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-100">
                  <th className="border border-black p-1 w-24">RIO / LAGOA</th>
                  <th className="border border-black p-1">MUNICÍPIO / ESTAÇÃO</th>
                  <th className="border border-black p-1 w-16">24 HORAS ANTES</th>
                  <th className="border border-black p-1 w-16 text-red-600">ANTEPENÚLTIMA</th>
                  <th className="border border-black p-1 w-16 text-red-600">PENÚLTIMA</th>
                  <th className="border border-black p-1 w-16 bg-yellow-50 font-bold uppercase">Última</th>
                  <th className="border border-black p-1 w-12">TEND.</th>
                  <th className="border border-black p-1 w-16">FONTE</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(estacoesAgrupadas).map(([nomeRio, municipios]) => (
                  municipios.map((estacao, index) => {
                    const hist = historico[estacao.id] || {}
                    const atual = dadosDaTela[estacao.id]?.nivel || "N/INF"
                    const limite = estacao.nivel_transbordo

                    return (
                      <tr key={estacao.id} className="text-center font-medium">
                        {index === 0 && (
                          <td rowSpan={municipios.length} className="border border-black font-bold bg-slate-50 p-1 align-middle uppercase">
                            {nomeRio}
                          </td>
                        )}
                        <td className="border border-black p-1 text-left">{estacao.municipio}</td>
                        
                        {/* APLICAÇÃO DE CORES EM TODAS AS COLUNAS */}
                        <td className={`border border-black p-1 ${obterCorNivel(hist.vinteQuatroHoras, limite)}`}>{hist.vinteQuatroHoras}</td>
                        <td className={`border border-black p-1 ${obterCorNivel(hist.antepenultima, limite)}`}>{hist.antepenultima}</td>
                        <td className={`border border-black p-1 ${obterCorNivel(hist.penultima, limite)}`}>{hist.penultima}</td>
                        <td className={`border border-black p-1 font-bold ${obterCorNivel(atual, limite) || 'bg-yellow-50'}`}>{atual}</td>
                        
                        <td className="border border-black p-1 font-bold text-base leading-none">
                          {obterTendencia(atual, hist.penultima)}
                        </td>
                        <td className="border border-black p-1 text-[8px] uppercase">{estacao.fonte}</td>
                      </tr>
                    )
                  })
                ))}
              </tbody>
            </table>

            {/* LEGENDA NO RODAPÉ */}
            <div className="mt-6 flex gap-6 text-[10px] font-bold uppercase no-print">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 border border-black"></div> Atenção (85%)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-600 border border-black"></div> Transbordo (100%)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-600 border border-black"></div> Extremo (120%)</div>
            </div>
          </div>

          <div className="absolute bottom-10 left-0 right-0 text-center text-[10px] text-slate-400 italic">
            Gerado automaticamente pelo Sistema Integrado REDEC 10 - Norte
          </div>
        </div>
      </div>
    </div>
  )
}
