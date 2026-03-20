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

  // 1. BUSCA O HISTÓRICO ASSIM QUE O MODAL ABRE
  useEffect(() => {
    buscarHistorico()
  }, [])

  async function buscarHistorico() {
    setLoading(true)
    const novoHistorico = {}

    for (const estacao of estacoes) {
      // Busca as duas últimas medições reais do banco
      const { data: ultimas } = await supabase
        .from("medicoes")
        .select("nivel")
        .eq("estacao_id", estacao.id)
        .order("data", { ascending: false })
        .order("hora", { ascending: false })
        .limit(2)

      // Busca medição de 24h atrás
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

  // 2. LÓGICA DE AGRUPAMENTO (Transforma lista em grupos de Rios)
  const agruparEstacoesPorRio = (lista) => {
    return lista.reduce((acc, estacao) => {
      const nomeRio = estacao.rios?.nome || "Outros"
      if (!acc[nomeRio]) acc[nomeRio] = []
      acc[nomeRio].push(estacao)
      return acc
    }, {})
  }

  const estacoesAgrupadas = agruparEstacoesPorRio(estacoes)

  // TELA DE CARREGAMENTO
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999]">
        <div className="bg-white p-6 rounded-lg shadow-2xl text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="font-bold text-slate-700 tracking-tight">Processando dados e histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] p-4 overflow-auto">
      <div className="bg-slate-200 min-h-screen w-full max-w-6xl p-8 rounded-lg relative">
        
        {/* BOTÕES DE AÇÃO */}
        <div className="flex justify-end gap-3 mb-4 no-print">
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 shadow-md"
          >
            Imprimir / PDF
          </button>
          <button 
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 shadow-md"
          >
            Fechar
          </button>
        </div>

        {/* ÁREA DO INFORMATIVO (FORMATO PAPEL) */}
        <div id="informativo-folha" className="bg-white shadow-2xl mx-auto w-[1000px] border border-slate-300 min-h-[1400px]">
          
          {/* CABEÇALHO GOVERNO / DEFESA CIVIL */}
          <div className="flex w-full h-24">
            <div className="bg-[#f37021] w-1/2 flex items-center p-8">
              <h2 className="text-white text-2xl font-black italic uppercase leading-tight">
                Secretaria de Estado de <br/> Defesa Civil
              </h2>
            </div>
            <div className="bg-[#0054a6] w-1/2 flex flex-col justify-center items-end p-8 text-white text-right">
              <span className="text-lg font-bold uppercase tracking-widest">REDEC 10 - NORTE</span>
              <span className="text-sm italic opacity-90">Informativo Diário de Monitoramento</span>
            </div>
          </div>

          <div className="p-6">
            {/* TABELA PRINCIPAL */}
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1 w-24">RIO / LAGOA</th>
                  <th className="border border-black p-1">MUNICÍPIO / ESTAÇÃO</th>
                  <th className="border border-black p-1 w-16">24 HORAS ANTES</th>
                  <th className="border border-black p-1 w-16 text-red-600">ANTEPENÚLTIMA MEDIÇÃO</th>
                  <th className="border border-black p-1 w-16 text-red-600">PENÚLTIMA MEDIÇÃO</th>
                  <th className="border border-black p-1 w-16 bg-yellow-50 font-bold uppercase">Última Medição</th>
                  <th className="border border-black p-1 w-12 bg-slate-50">SITUAÇÃO</th>
                  <th className="border border-black p-1 w-16">FONTE</th>
                </tr>
              </thead>
              <tbody>
                {/* O próximo passo será o preenchimento aqui */}
                <tr>
                    <td colSpan="8" className="p-20 text-center text-slate-400 italic text-sm">
                        Estrutura pronta. Aguardando lógica de preenchimento das linhas...
                    </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
