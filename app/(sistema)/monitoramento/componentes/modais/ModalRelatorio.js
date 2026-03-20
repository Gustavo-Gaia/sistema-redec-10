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

  // 1. EFEITO INICIAL: Busca o passado assim que o modal abre
  useEffect(() => {
    buscarHistorico()
  }, [])

  // 2. BUSCA NO BANCO: 24h atrás, Penúltima e Antepenúltima
  async function buscarHistorico() {
    setLoading(true)
    const novoHistorico = {}

    for (const estacao of estacoes) {
      // Busca as duas últimas medições registradas para Penúltima e Antepenúltima
      const { data: ultimas } = await supabase
        .from("medicoes")
        .select("nivel")
        .eq("estacao_id", estacao.id)
        .order("data", { ascending: false })
        .order("hora", { ascending: false })
        .limit(2)

      // Cálculo de 24h atrás (Data de Ontem)
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

  // 3. LÓGICA DE AGRUPAMENTO: Organiza por Rio para o rowSpan
  const agruparEstacoesPorRio = (lista) => {
    return lista.reduce((acc, estacao) => {
      const nomeRio = estacao.rios?.nome || "Outros"
      if (!acc[nomeRio]) acc[nomeRio] = []
      acc[nomeRio].push(estacao)
      return acc
    }, {})
  }

  const estacoesAgrupadas = agruparEstacoesPorRio(estacoes)

  // 4. INTERFACE DE CARREGAMENTO
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999]">
        <div className="bg-white p-6 rounded-lg shadow-2xl text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="font-bold text-slate-700">Gerando histórico do relatório...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] p-4 overflow-auto">
      <div className="bg-slate-100 min-h-screen w-full max-w-5xl p-8 rounded-lg relative">
        
        {/* BOTÃO FECHAR */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Fechar Relatório
        </button>

        {/* ÁREA DO RELATÓRIO (Onde montaremos a tabela no próximo passo) */}
        <div id="relatorio-conteudo" className="bg-white shadow-2xl mx-auto p-0 w-[1000px]">
          <div className="p-10 text-center text-slate-400">
            Dados carregados com sucesso. <br/>
            Pronto para desenhar a tabela com {Object.keys(estacoesAgrupadas).length} rios/lagoas.
          </div>
        </div>

      </div>
    </div>
  )
}
