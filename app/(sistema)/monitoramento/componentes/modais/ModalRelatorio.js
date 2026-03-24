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
      // Busca histórico das estações selecionadas
      const { data: todasMedicoes, error } = await supabase
        .from("medicoes")
        .select("estacao_id, nivel, data_hora")
        .in("estacao_id", estacoes.map(e => e.id))
        .order("data_hora", { ascending: false })
        .limit(1000)

      if (error) throw error

      const agora = new Date()
      const vinteQuatroHorasAtras = new Date(agora.getTime() - (24 * 60 * 60 * 1000))

      estacoes.forEach(estacao => {
        const medSessao = todasMedicoes?.filter(m => Number(m.estacao_id) === Number(estacao.id)) || []
        
        // Busca a medição mais próxima de 24h atrás
        const m24h = medSessao.find(m => new Date(m.data_hora) <= vinteQuatroHorasAtras)

        novoHistorico[estacao.id] = {
          vinteQuatroHoras: m24h?.nivel ?? "N/INF",
          penultima: medSessao[0]?.nivel ?? "N/INF",
          antepenultima: medSessao[1]?.nivel ?? "N/INF",
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
        pixelRatio: 2,
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
    if (nivel === undefined || nivel === null || nivel === "N/INF" || !limite) return ""
    const n = parseFloat(nivel); 
    const l = parseFloat(limite)
    if (n >= l * 1.2) return "bg-[#ff00ff] text-white" 
    if (n >= l) return "bg-[#ff0000] text-white"
    if (n >= l * 0.85) return "bg-[#ffc000] text-black font-black"
    return ""
  }

  // 🚀 LÓGICA DE AGRUPAMENTO QUE RESPEITA A ORDEM DOS IDS
  const nomesRiosOrdenados = []
  const estacoesAgrupadas = estacoes.reduce((acc, est) => {
    const rio = est.rios?.nome || "OUTROS"
    if (!acc[rio]) {
      acc[rio] = []
      nomesRiosOrdenados.push(rio) // Mantém a ordem de aparição baseada no ID
    }
    acc[rio].push(est)
    return acc
  }, {})

  if (loading) return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999] text-white font-bold italic animate-pulse">
      SISTEMA REDEC 10 - ORGANIZANDO DADOS GEOGRÁFICOS...
    </div>
  )

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[999] p-4 overflow-auto scrollbar-hide">
      
      {/* BOTÕES DE CONTROLE */}
      <div className="fixed top-6 right-6 flex gap-3 no-print z-[1001]">
        <button onClick={exportarImagem} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black text-[14px] uppercase shadow-2xl transition-all active:scale-95 flex items-center gap-2">
          <span>📸</span> Salvar para Instagram
        </button>
        <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-[14px] uppercase shadow-2xl transition-all">
          Fechar
        </button>
      </div>

      <div ref={reportRef} className="p-8 bg-white flex flex-col items-center shadow-2xl">
        
        <div className="bg-white border-[4px] border-black flex flex-col w-fit min-w-[1050px]">
          
          {/* CABEÇALHO DO RELATÓRIO */}
          <div className="bg-[#ffc000] border-b-[4px] border-black p-3 text-center">
            <h1 className="text-2xl font-black uppercase italic leading-none tracking-tighter text-black">
              MONITORAMENTO DOS RIOS - REDEC 10 - NORTE / REDEC 11 - NOROESTE
            </h1>
          </div>

          <table className="border-collapse table-auto w-full">
            <thead>
              <tr className="bg-[#8db4e2] text-[15px] uppercase font-black text-black text-center">
                <th className="border-2 border-black p-2 w-[180px]">RIOS / LAGOAS</th>
                <th className="border-2 border-black p-2 text-left px-4">MUNICÍPIOS / ESTAÇÃO</th>
                <th className="border-2 border-black p-2 w-24 text-red-700 bg-[#ffffcc]">TRANSB.</th>
                <th className="border-2 border-black p-2 w-28">24H ANTES</th>
                <th className="border-2 border-black p-2 w-28">ANTEPENÚLT.</th>
                <th className="border-2 border-black p-2 w-28">PENÚLTIMA</th>
                <th className="border-2 border-black p-2 w-28 bg-blue-100">ÚLTIMA</th>
                <th className="border-2 border-black p-2 w-24">FONTE</th>
              </tr>
            </thead>
            <tbody>
              {nomesRiosOrdenados.map((rio) => {
                const lista = estacoesAgrupadas[rio]
                return lista.map((estacao, idx) => {
                  const hist = historico[estacao.id] || {}
                  const atual = dadosDaTela[estacao.id]?.nivel || "N/INF"
                  const limite = estacao.nivel_transbordo

                  const formatarNivel = (v) => {
                    if (v === "N/INF" || v === undefined || v === null) return "N/INF"
                    return parseFloat(v).toFixed(2).replace('.', ',')
                  }

                  return (
                    <tr key={estacao.id} className="text-center font-black text-[14px] leading-none text-black">
                      {idx === 0 && (
                        <td rowSpan={lista.length} className="border-2 border-black bg-[#d9e1f2] align-middle p-2 uppercase font-black text-[16px]">
                          {rio}
                        </td>
                      )}
                      <td className="border-2 border-black p-2 px-4 text-left uppercase text-[15px] font-black leading-none whitespace-nowrap">
                        {estacao.municipio}
                      </td>
                      <td className="border-2 border-black p-2 text-red-600 font-black bg-[#ffffcc] text-[17px]">
                        {limite ? parseFloat(limite).toFixed(2).replace('.', ',') : "—"}
                      </td>
                      
                      <td className={`border-2 border-black p-2 font-black ${obterCorNivel(hist.vinteQuatroHoras, limite)}`}>
                        {formatarNivel(hist.vinteQuatroHoras)}
                      </td>
                      <td className={`border-2 border-black p-2 font-black ${obterCorNivel(hist.antepenultima, limite)}`}>
                        {formatarNivel(hist.antepenultima)}
                      </td>
                      <td className={`border-2 border-black p-2 font-black ${obterCorNivel(hist.penultima, limite)}`}>
                        {formatarNivel(hist.penultima)}
                      </td>
                      <td className={`border-2 border-black p-2 font-black border-l-4 ${obterCorNivel(atual, limite)}`}>
                        {formatarNivel(atual)}
                      </td>
                      <td className="border-2 border-black p-2 text-[11px] uppercase font-black bg-slate-50">
                        {estacao.fonte}
                      </td>
                    </tr>
                  )
                })
              })}
            </tbody>
          </table>

          {/* RODAPÉ E LEGENDAS */}
          <div className="p-4 bg-white border-t-[4px] border-black mt-auto">
            <div className="flex gap-12 mb-4 items-center justify-center">
              <div className="flex items-center gap-3"><div className="w-7 h-7 bg-[#ffc000] border-2 border-black"></div> <span className="text-[14px] font-black uppercase">ALERTA</span></div>
              <div className="flex items-center gap-3"><div className="w-7 h-7 bg-[#ff0000] border-2 border-black"></div> <span className="text-[14px] font-black uppercase">TRANSBORDO</span></div>
              <div className="flex items-center gap-3"><div className="w-7 h-7 bg-[#ff00ff] border-2 border-black"></div> <span className="text-[14px] font-black uppercase">20% ACIMA</span></div>
            </div>

            <div className="border-[3px] border-black rounded-2xl p-4 bg-slate-50 shadow-inner">
              <p className="text-[11px] font-bold leading-tight text-black italic mb-2 text-center">
                * Última Medição Válida / N/INF - Não Informado / A/R - Abaixo da régua / INOP - Inoperante / DBM - Destacamento de Bombeiro Militar. 
                COMDEC - Coordenadoria Municipal de Defesa Civil / CPRM - Serviço Geológico do Brasil / 
                ANA - Agência Nacional de Águas / INEA - Instituto Estadual do Ambiente
              </p>
              <div className="h-[2px] bg-black/20 my-2 w-full"></div>
              <p className="text-[11px] font-black leading-tight text-black italic text-center">
                Obs.: A dinâmica dos níveis dos rios é calculada com os dados disponíveis no momento, tendo como base as medições recebidas, 
                podendo sofrer influência da rede de comunicação ou atualização dos aparelhos automáticos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
