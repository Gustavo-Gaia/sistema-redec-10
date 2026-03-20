/* app/(sistema)/monitoramento/componentes/modais/ModalRelatorio.js */

"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { toPng } from "html-to-image" // Importação padrão agora que está no package.json

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ModalRelatorio({ dadosDaTela, estacoes, onClose }) {
  const [historico, setHistorico] = useState({})
  const [loading, setLoading] = useState(true)
  const reportRef = useRef(null)

  useEffect(() => {
    buscarHistoricoCompleto()
  }, [])

  async function buscarHistoricoCompleto() {
    setLoading(true)
    const novoHistorico = {}
    try {
      const { data: todasMedicoes } = await supabase
        .from("medicoes")
        .select("estacao_id, nivel, data")
        .in("estacao_id", estacoes.map(e => e.id))
        .order("data", { ascending: false })
        .order("hora", { ascending: false })

      const dataOntemISO = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      estacoes.forEach(estacao => {
        const medSessao = todasMedicoes?.filter(m => m.estacao_id === estacao.id) || []
        const m24h = medSessao.find(m => m.data === dataOntemISO)

        novoHistorico[estacao.id] = {
          vinteQuatroHoras: m24h?.nivel || "N/INF",
          antepenultima: medSessao[2]?.nivel || "N/INF",
          penultima: medSessao[1]?.nivel || "N/INF",
        }
      })
      setHistorico(novoHistorico)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const exportarImagem = async () => {
    if (!reportRef.current) return;
    try {
      const dataUrl = await toPng(reportRef.current, { 
        cacheBust: true,
        backgroundColor: '#fff',
        style: { borderRadius: '0' } // Garante bordas retas na foto
      });
      const link = document.createElement('a');
      link.download = `informativo-redec10-${new Date().toLocaleDateString('pt-BR')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
    }
  }

  const obterCorNivel = (nivel, limite) => {
    if (!nivel || nivel === "N/INF" || !limite) return ""
    const n = parseFloat(nivel); const l = parseFloat(limite)
    if (n >= l * 1.2) return "bg-[#ff00ff] text-white" 
    if (n >= l) return "bg-[#ff0000] text-white"
    if (n >= l * 0.85) return "bg-[#ffc000] text-black font-black"
    return ""
  }

  const estacoesAgrupadas = estacoes.reduce((acc, est) => {
    const rio = est.rios?.nome || "OUTROS"
    if (!acc[rio]) acc[rio] = []
    acc[rio].push(est)
    return acc
  }, {})

  if (loading) return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999] text-white font-bold italic">
      SISTEMA REDEC 10 - PROCESSANDO DADOS...
    </div>
  )

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[999] p-4 overflow-auto scrollbar-hide">
      
      <div className="fixed top-4 right-4 flex gap-2 no-print z-[1001]">
        <button onClick={exportarImagem} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase shadow-xl transition-all">Salvar Foto</button>
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase shadow-xl">Imprimir</button>
        <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase shadow-xl">Fechar</button>
      </div>

      {/* ÁREA DO RELATÓRIO (REF PARA PNG) */}
      <div ref={reportRef} className="bg-white w-[1000px] border-[3px] border-black flex flex-col shadow-2xl">
        
        {/* CABEÇALHO SÓLIDO */}
        <div className="bg-[#ffc000] border-b-[3px] border-black p-3 text-center">
          <h1 className="text-xl font-black uppercase italic leading-none tracking-tighter">MONITORAMENTO DOS RIOS - REDEC 10 - NORTE / REDEC 11 - NOROESTE</h1>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#8db4e2] text-[10px] uppercase font-black">
              <th className="border-2 border-black p-2 w-32">RIOS / LAGOAS</th>
              <th className="border-2 border-black p-2">MUNICÍPIOS / ESTAÇÃO</th>
              <th className="border-2 border-black p-2 w-16 text-red-700">TRANSB.</th>
              <th className="border-2 border-black p-2 w-20">24H ANTES</th>
              <th className="border-2 border-black p-2 w-20 text-red-600">ANTEPENÚLT.</th>
              <th className="border-2 border-black p-2 w-20 text-red-600">PENÚLTIMA</th>
              <th className="border-2 border-black p-2 w-20 bg-[#ffff00]">ÚLTIMA</th>
              <th className="border-2 border-black p-2 w-16 font-black">FONTE</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(estacoesAgrupadas).map(([rio, lista]) => (
              lista.map((estacao, idx) => {
                const hist = historico[estacao.id] || {}
                const atual = dadosDaTela[estacao.id]?.nivel || "N/INF"
                const limite = estacao.nivel_transbordo

                return (
                  <tr key={estacao.id} className="text-center font-bold text-[11px] leading-tight">
                    {idx === 0 && (
                      <td rowSpan={lista.length} className="border-2 border-black bg-[#d9e1f2] align-middle p-2 uppercase font-black">
                        {rio}
                      </td>
                    )}
                    <td className="border-2 border-black p-1.5 text-left uppercase whitespace-nowrap">{estacao.municipio}</td>
                    <td className="border-2 border-black p-1.5 text-red-600 font-black">{limite?.toFixed(2).replace('.',',')}</td>
                    
                    <td className={`border-2 border-black p-1.5 ${obterCorNivel(hist.vinteQuatroHoras, limite)}`}>
                        {hist.vinteQuatroHoras !== "N/INF" ? parseFloat(hist.vinteQuatroHoras).toFixed(2).replace('.',',') : "N/INF"}
                    </td>
                    <td className={`border-2 border-black p-1.5 ${obterCorNivel(hist.antepenultima, limite)}`}>
                        {hist.antepenultima !== "N/INF" ? parseFloat(hist.antepenultima).toFixed(2).replace('.',',') : "N/INF"}
                    </td>
                    <td className={`border-2 border-black p-1.5 ${obterCorNivel(hist.penultima, limite)}`}>
                        {hist.penultima !== "N/INF" ? parseFloat(hist.penultima).toFixed(2).replace('.',',') : "N/INF"}
                    </td>
                    <td className={`border-2 border-black p-1.5 ${obterCorNivel(atual, limite) || 'bg-[#ffffcc]'}`}>
                        {atual !== "N/INF" ? parseFloat(atual).toFixed(2).replace('.',',') : "N/INF"}
                    </td>
                    <td className="border-2 border-black p-1.5 text-[9px] uppercase font-black">{estacao.fonte}</td>
                  </tr>
                )
              })
            ))}
          </tbody>
        </table>

        {/* LEGENDA IDÊNTICA À PLANILHA */}
        <div className="p-4 bg-white border-t-[3px] border-black mt-auto">
          <div className="flex gap-10 mb-3 items-center">
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#ffc000] border-2 border-black"></div> <span className="text-[10px] font-black uppercase tracking-tighter">ALERTA (15% PARA TRANSB.)</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#ff0000] border-2 border-black"></div> <span className="text-[10px] font-black uppercase tracking-tighter">TRANSBORDO</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#ff00ff] border-2 border-black"></div> <span className="text-[10px] font-black uppercase tracking-tighter">20% ACIMA DO TRANSB.</span></div>
          </div>
          <p className="text-[9px] font-bold uppercase leading-tight text-slate-600 italic">
            * Informativo gerado automaticamente pelo Sistema Integrado REDEC 10 - Norte. Dados sujeitos a revisão.
          </p>
        </div>
      </div>
    </div>
  )
}
