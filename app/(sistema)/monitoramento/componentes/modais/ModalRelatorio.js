"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { toPng } from "html-to-image"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ModalRelatorio({ dadosDaTela, estacoes, colunasVisiveis, onClose }) {
  const [historico, setHistorico] = useState({})
  const [loading, setLoading] = useState(true)
  const reportRef = useRef(null)

  useEffect(() => {
    buscarHistoricoCompleto()
  }, [])

  // =========================
  // 🔥 FUNÇÃO CENTRAL (AQUI ESTÁ O SEGREDO)
  // =========================
  function formatarNivel(medicao) {
    if (!medicao) return "N/INF"

    if (medicao.abaixo_regua) return "A/R"

    if (medicao.nivel === null || medicao.nivel === undefined)
      return "N/INF"

    return parseFloat(medicao.nivel).toFixed(2).replace(".", ",")
  }

  // =========================
  // 📡 BUSCAR HISTÓRICO
  // =========================
  async function buscarHistoricoCompleto() {
    setLoading(true)

    const novoHistorico = {}

    try {
      const agora = new Date()
      const vinteQuatroHorasAtras = new Date(
        agora.getTime() - 24 * 60 * 60 * 1000
      ).toISOString()

      await Promise.all(
        estacoes.map(async (estacao) => {

          const { data: ultimas } = await supabase
            .from("medicoes")
            .select("nivel, abaixo_regua")
            .eq("estacao_id", estacao.id)
            .order("data_hora", { ascending: false })
            .limit(3)

          const { data: m24hData } = await supabase
            .from("medicoes")
            .select("nivel, abaixo_regua")
            .eq("estacao_id", estacao.id)
            .lte("data_hora", vinteQuatroHorasAtras)
            .order("data_hora", { ascending: false })
            .limit(1)

          novoHistorico[estacao.id] = {
            vinteQuatroHoras: m24hData?.[0] || null,
            penultima: ultimas?.[1] || null,
            antepenultima: ultimas?.[2] || null,
          }
        })
      )

      setHistorico(novoHistorico)
    } catch (err) {
      console.error("Erro ao carregar histórico:", err)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // 📸 EXPORTAR IMAGEM
  // =========================
  const exportarImagem = async () => {
    if (!reportRef.current) return

    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      })

      const link = document.createElement("a")
      link.download = `informativo-${new Date().toLocaleDateString("pt-BR")}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Erro ao gerar imagem:", error)
    }
  }

  // =========================
  // 🎨 COR
  // =========================
  const obterCorNivel = (medicao, limite) => {
    if (!medicao || medicao.abaixo_regua || !limite) return ""

    const n = parseFloat(medicao.nivel)
    const l = parseFloat(limite)

    if (n >= l * 1.2) return "bg-[#ff00ff] text-white"
    if (n >= l) return "bg-[#ff0000] text-white"
    if (n >= l * 0.85) return "bg-[#ffc000] text-black font-black"

    return ""
  }

  const nomesRiosOrdenados = []
  const estacoesAgrupadas = estacoes.reduce((acc, est) => {
    const rio = est.rios?.nome || "OUTROS"

    if (!acc[rio]) {
      acc[rio] = []
      nomesRiosOrdenados.push(rio)
    }

    acc[rio].push(est)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999] text-white font-bold italic">
        PROCESSANDO DADOS...
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[999] p-4 overflow-auto">

      <div className="fixed top-4 right-4 flex gap-2 z-[1001]">
        <button onClick={exportarImagem} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-black text-xs">
          📸 Salvar
        </button>
        <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-black text-xs">
          Fechar
        </button>
      </div>

      <div ref={reportRef} className="p-6 bg-white">

        <table className="border-collapse w-full text-sm">
          <thead>
            <tr className="bg-[#8db4e2] font-black text-center">
              <th>RIO</th>
              <th>MUNICÍPIO</th>
              <th>TRANSB.</th>

              {colunasVisiveis.v24h && <th>24H</th>}
              {colunasVisiveis.antepenultima && <th>ANTEPEN.</th>}
              {colunasVisiveis.penultima && <th>PENÚLT.</th>}

              <th>ÚLTIMA</th>
              <th>FONTE</th>
            </tr>
          </thead>

          <tbody>
            {nomesRiosOrdenados.map((rio) => {
              const lista = estacoesAgrupadas[rio]

              return lista.map((estacao, idx) => {
                const hist = historico[estacao.id] || {}

                const atual = dadosDaTela[estacao.id]

                return (
                  <tr key={estacao.id} className="text-center font-bold">

                    {idx === 0 && (
                      <td rowSpan={lista.length}>{rio}</td>
                    )}

                    <td>{estacao.municipio}</td>

                    <td>
                      {estacao.nivel_transbordo || "—"}
                    </td>

                    {colunasVisiveis.v24h && (
                      <td className={obterCorNivel(hist.vinteQuatroHoras, estacao.nivel_transbordo)}>
                        {formatarNivel(hist.vinteQuatroHoras)}
                      </td>
                    )}

                    {colunasVisiveis.antepenultima && (
                      <td className={obterCorNivel(hist.antepenultima, estacao.nivel_transbordo)}>
                        {formatarNivel(hist.antepenultima)}
                      </td>
                    )}

                    {colunasVisiveis.penultima && (
                      <td className={obterCorNivel(hist.penultima, estacao.nivel_transbordo)}>
                        {formatarNivel(hist.penultima)}
                      </td>
                    )}

                    <td className={obterCorNivel(atual, estacao.nivel_transbordo)}>
                      {formatarNivel(atual)}
                    </td>

                    <td>{estacao.fonte}</td>

                  </tr>
                )
              })
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
