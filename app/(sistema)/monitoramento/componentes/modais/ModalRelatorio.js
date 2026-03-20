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

  // Datas para o cabeçalho
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  const ontem = new Date(Date.now() - 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })

  useEffect(() => {
    buscarHistoricoCompleto()
  }, [])

  async function buscarHistoricoCompleto() {
    setLoading(true)
    const novoHistorico = {}

    try {
      // Buscamos as últimas medições de todas as estações de uma vez para ganhar performance
      const { data: todasMedicoes, error } = await supabase
        .from("medicoes")
        .select("estacao_id, nivel, data")
        .in("estacao_id", estacoes.map(e => e.id))
        .order("data", { ascending: false })
        .order("hora", { ascending: false })

      if (error) throw error

      estacoes.forEach(estacao => {
        const medSessao = todasMedicoes.filter(m => m.estacao_id === estacao.id)
        
        // Simulação de 24h atrás baseada na data
        const dataOntemISO = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const m24h = medSessao.find(m => m.data === dataOntemISO)

        novoHistorico[estacao.id] = {
          vinteQuatroHoras: m24h?.nivel || "N/INF",
          antepenultima: medSessao[1]?.nivel || "N/INF",
          penultima: medSessao[0]?.nivel || "N/INF"
        }
      })

      setHistorico(novoHistorico)
    } catch (err) {
      console.error("Erro ao carregar histórico:", err)
    } finally {
      setLoading(false)
    }
  }

  const obterCorNivel = (nivel, limite) => {
    if (!nivel || nivel === "N/INF" || !limite) return ""
    const n = parseFloat(nivel)
    const l = parseFloat(limite)
    if (n >= l * 1.2) return "bg-[#ff00ff] text-white print:bg-[#ff00ff]" // Extremo (Lilás/Roxo)
    if (n >= l) return "bg-[#ff0000] text-white print:bg-[#ff0000]"       // Transbordo (Vermelho)
    if (n >= l * 0.85) return "bg-[#ffc000] text-black print:bg-[#ffc000]" // Alerta (Laranja/Amarelo)
    return ""
  }

  const agruparPorRio = (lista) => {
    return lista.reduce((acc, estacao) => {
      const rio = estacao.rios?.nome || "OUTROS"
      if (!acc[rio]) acc[rio] = []
      acc[rio].push(estacao)
      return acc
    }, {})
  }

  const estacoesAgrupadas = agruparPorRio(estacoes)

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999]">
        <div className="text-white text-xl font-bold animate-pulse">CARREGANDO DADOS...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-800 flex items-center justify-center z-[999] p-4 overflow-auto print:p-0 print:bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: portrait; margin: 1cm; }
          .no-print { display: none !important; }
          #informativo { width: 100% !important; border: 1px solid black !important; }
        }
      `}} />

      {/* BOTÕES FLUTUANTES NO MODAL */}
      <div className="absolute top-4 right-10 flex gap-4 no-print">
        <button onClick={() => window.print()} className="bg-green-600 text-white px-6 py-2 rounded shadow-xl font-bold">IMPRIMIR RELATÓRIO</button>
        <button onClick={onClose} className="bg-red-600 text-white px-6 py-2 rounded shadow-xl font-bold">FECHAR</button>
      </div>

      <div id="informativo" className="bg-white w-[950px] min-h-[1200px] border-2 border-black p-0 flex flex-col">
        
        {/* HEADER AMARELO (IGUAL À IMAGEM 2) */}
        <div className="bg-[#ffc000] border-b-2 border-black p-2 text-center">
          <h1 className="text-lg font-black uppercase italic">
            Monitoramento dos Rios - REDEC 10 - NORTE / REDEC 11 - NOROESTE
          </h1>
        </div>

        {/* TABELA PRINCIPAL */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#8db4e2] text-sm uppercase">
              <th className="border-2 border-black p-2 w-[150px]">Rios / Lagoas</th>
              <th className="border-2 border-black p-2">Municípios</th>
              <th className="border-2 border-black p-2 w-[80px] text-red-600">Transbordo</th>
              <th className="border-2 border-black p-2 w-[100px]">{ontem}<br/>08h</th>
              <th className="border-2 border-black p-2 w-[100px]">{hoje}<br/>08h</th>
              <th className="border-2 border-black p-2 w-[100px]">Fonte</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(estacoesAgrupadas).map(([rio, lista]) => (
              lista.map((estacao, idx) => {
                const hist = historico[estacao.id] || {}
                const atual = dadosDaTela[estacao.id]?.nivel || "N/INF"
                const limite = estacao.nivel_transbordo

                return (
                  <tr key={estacao.id} className="text-center font-bold text-sm">
                    {idx === 0 && (
                      <td rowSpan={lista.length} className="border-2 border-black bg-[#d9e1f2] align-middle p-2 uppercase">
                        {rio}
                      </td>
                    )}
                    <td className="border-2 border-black p-2 text-left uppercase whitespace-nowrap">
                      {estacao.municipio} - {estacao.id.toString().includes('inea') ? 'RJ' : 'MG/RJ'}
                    </td>
                    <td className="border-2 border-black p-2 text-red-600 bg-slate-50">
                      {limite?.toFixed(2).replace('.', ',')}
                    </td>
                    {/* Medição de Ontem */}
                    <td className={`border-2 border-black p-2 ${obterCorNivel(hist.vinteQuatroHoras, limite)}`}>
                      {hist.vinteQuatroHoras !== "N/INF" ? parseFloat(hist.vinteQuatroHoras).toFixed(2).replace('.', ',') : "N/INF"}
                    </td>
                    {/* Medição de Hoje (O que está na tela) */}
                    <td className={`border-2 border-black p-2 ${obterCorNivel(atual, limite)}`}>
                      {atual !== "N/INF" ? parseFloat(atual).toFixed(2).replace('.', ',') : "N/INF"}
                    </td>
                    <td className="border-2 border-black p-2 text-[11px]">
                      {estacao.fonte}
                    </td>
                  </tr>
                )
              })
            ))}
          </tbody>
        </table>

        {/* LEGENDA E NOTAS (IGUAL À IMAGEM 2) */}
        <div className="p-4 mt-auto">
          <div className="flex gap-8 mb-4">
            <div className="flex items-center gap-2"><div className="w-5 h-5 bg-[#ffc000] border border-black"></div> <span className="text-[10px] font-bold uppercase">Alerta (15% para o transbordo)</span></div>
            <div className="flex items-center gap-2"><div className="w-5 h-5 bg-[#ff0000] border border-black"></div> <span className="text-[10px] font-bold uppercase">Transbordo</span></div>
            <div className="flex items-center gap-2"><div className="w-5 h-5 bg-[#ff00ff] border border-black"></div> <span className="text-[10px] font-bold uppercase">20% acima do transbordo</span></div>
          </div>

          <div className="text-[9px] space-y-1 border-t border-black pt-2 leading-tight">
            <p><strong>* Última Medição Válida / N/INF - Não Informado / A/R - Abaixo da régua / INOP - Inoperante</strong></p>
            <p>COMDEC - Coordenadoria Municipal de Defesa Civil / CPRM - Serviço Geológico do Brasil / Hidroweb - ANA / INEA - Instituto Estadual do Ambiente</p>
            <p className="mt-2"><strong>Obs.:</strong> A dinâmica dos níveis dos rios é calculada com os dados disponíveis no momento...</p>
          </div>
        </div>

      </div>
    </div>
  )
}
