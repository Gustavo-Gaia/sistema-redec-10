/* app/(sistema)/monitoramento/componentes/modais/ModalRelatorio.js */

"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { toPng } from "html-to-image"

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
      const { data: todasMedicoes, error } = await supabase
        .from("medicoes")
        .select("estacao_id, nivel, data_hora")
        .in("estacao_id", estacoes.map(e => e.id))
        .order("data_hora", { ascending: false })
        .limit(800)

      if (error) throw error

      const agora = new Date()
      const vinteQuatroHorasAtras = new Date(agora.getTime() - (24 * 60 * 60 * 1000))

      estacoes.forEach(estacao => {
        const medSessao = todasMedicoes?.filter(m => Number(m.estacao_id) === Number(estacao.id)) || []
        const m24h = medSessao.find(m => new Date(m.data_hora) <= vinteQuatroHorasAtras)

        novoHistorico[estacao.id] = {
          vinteQuatroHoras: m24h?.nivel || "N/INF",
          penultima: medSessao[0]?.nivel || "N/INF",
          antepenultima: medSessao[1]?.nivel || "N/INF",
        }
      })
      setHistorico(novoHistorico)
    } catch (err) {
      console.error("Erro ao carregar histórico:", err)
    } finally {
      setLoading(false)
    }
  }

  const exportarImagem = async () => {
    if (!reportRef.current) return;
    try {
      const dataUrl = await toPng(reportRef.current, { 
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2, // Dobra a resolução para não pixelar no Instagram
        style: { borderRadius: '0' }
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
        <button onClick={exportarImagem} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-black text-[12px] uppercase shadow-xl transition-all">📸 Salvar para Instagram</button>
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black text-[12px] uppercase shadow-xl">Imprimir</button>
        <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-black text-[12px] uppercase shadow-xl">Fechar</button>
      </div>

      <div ref={reportRef} className="p-10 bg-white flex flex-col items-center">
        
        <div className="bg-white w-[1150px] border-[4px] border-black flex flex-col shadow-none">
          
          <div className="bg-[#ffc000] border-b-[4px] border-black p-5 text-center">
            <h1 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-black">MONITORAMENTO DOS RIOS - REDEC 10 - NORTE / REDEC 11 - NOROESTE</h1>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#8db4e2] text-[14px] uppercase font-black text-black">
                <th className="border-[3px] border-black p-4 w-[200px]">RIOS / LAGOAS</th>
                <th className="border-[3px] border-black p-4">MUNICÍPIOS / ESTAÇÃO</th>
                <th className="border-[3px] border-black p-4 w-[90px] text-red-700 bg-[#ffffcc]">TRANSB.</th>
                <th className="border-[3px] border-black p-4 w-[110px]">24H ANTES</th>
                <th className="border-[3px] border-black p-4 w-[110px] text-red-600">ANTEPENÚLT.</th>
                <th className="border-[3px] border-black p-4 w-[110px] text-red-600">PENÚLTIMA</th>
                <th className="border-[3px] border-black p-4 w-[110px] bg-[#ffff00]">ÚLTIMA</th>
                <th className="border-[3px] border-black p-4 w-24 font-black">FONTE</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(estacoesAgrupadas).map(([rio, lista]) => (
                lista.map((estacao, idx) => {
                  const hist = historico[estacao.id] || {}
                  const atual = dadosDaTela[estacao.id]?.nivel || "N/INF"
                  const limite = estacao.nivel_transbordo

                  return (
                    <tr key={estacao.id} className="text-center font-black text-[14px] leading-tight text-black">
                      {idx === 0 && (
                        <td rowSpan={lista.length} className="border-[3px] border-black bg-[#d9e1f2] align-middle p-4 uppercase font-black text-[16px]">
                          {rio}
                        </td>
                      )}
                      <td className="border-[3px] border-black p-3.5 text-left uppercase text-[13px] font-bold">
                        {estacao.municipio}
                      </td>
                      <td className="border-[3px] border-black p-3.5 text-red-600 font-black bg-[#ffffcc] text-[16px]">
                        {limite ? parseFloat(limite).toFixed(2).replace('.',',') : "—"}
                      </td>
                      
                      <td className={`border-[3px] border-black p-3.5 ${obterCorNivel(hist.vinteQuatroHoras, limite)}`}>
                          {hist.vinteQuatroHoras !== "N/INF" ? parseFloat(hist.vinteQuatroHoras).toFixed(2).replace('.',',') : "N/INF"}
                      </td>
                      <td className={`border-[3px] border-black p-3.5 ${obterCorNivel(hist.antepenultima, limite)}`}>
                          {hist.antepenultima !== "N/INF" ? parseFloat(hist.antepenultima).toFixed(2).replace('.',',') : "N/INF"}
                      </td>
                      <td className={`border-[3px] border-black p-3.5 ${obterCorNivel(hist.penultima, limite)}`}>
                          {hist.penultima !== "N/INF" ? parseFloat(hist.penultima).toFixed(2).replace('.',',') : "N/INF"}
                      </td>
                      <td className={`border-[3px] border-black p-3.5 ${obterCorNivel(atual, limite)}`}>
                          {atual !== "N/INF" ? parseFloat(atual).toFixed(2).replace('.',',') : "N/INF"}
                      </td>
                      <td className="border-[3px] border-black p-3.5 text-[12px] uppercase font-black">{estacao.fonte}</td>
                    </tr>
                  )
                })
              ))}
            </tbody>
          </table>

          <div className="p-6 bg-white border-t-[4px] border-black mt-auto">
            <div className="flex gap-14 mb-6 items-center justify-center">
              <div className="flex items-center gap-4"><div className="w-8 h-8 bg-[#ffc000] border-[3px] border-black"></div> <span className="text-[13px] font-black uppercase tracking-tighter">ALERTA (15% PARA TRANSB.)</span></div>
              <div className="flex items-center gap-4"><div className="w-8 h-8 bg-[#ff0000] border-[3px] border-black"></div> <span className="text-[13px] font-black uppercase tracking-tighter">TRANSBORDO</span></div>
              <div className="flex items-center gap-4"><div className="w-8 h-8 bg-[#ff00ff] border-[3px] border-black"></div> <span className="text-[13px] font-black uppercase tracking-tighter">20% ACIMA DO TRANSB.</span></div>
            </div>

            <div className="border-[3px] border-black rounded-2xl p-5 bg-slate-50 shadow-sm">
              <p className="text-[12px] font-bold leading-relaxed text-black italic mb-4">
                * Última Medição Válida / N/INF - Não Informado / A/R - Abaixo da régua / INOP - Inoperante / DBM - Destacamento de Bombeiro Militar. 
                COMDEC - Coordenadoria Municipal de Defesa Civil / CPRM - Serviço Geológico do Brasil / 
                HidroWeb - Rede Hidrometeorológica Nacional / INEA - Instituto Estadual do Ambiente (Sistema Alerta de Cheias)
              </p>
              <div className="h-[3px] bg-black my-4 w-full"></div>
              <p className="text-[12px] font-black leading-relaxed text-black italic">
                Obs.: A dinâmica dos níveis dos rios é calculada com os dados disponíveis no momento, tendo como base as duas últimas cotas, 
                podendo sofrer influência da dificuldade de comunicação entre os colaboradores ou demora na atualização dos aparelhos automáticos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
