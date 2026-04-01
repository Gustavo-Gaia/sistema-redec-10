/* app/(sistema)/monitoramento/componentes/modais/ModalRelatorioAtual.js */

"use client"

import { useRef } from "react"
import { toPng } from "html-to-image"

export default function ModalRelatorioAtual({
  dados,
  estacoes,
  cabecalho,
  onClose
}) {

  const reportRef = useRef(null)

  // ============================
  // EXPORTAR IMAGEM
  // ============================

  const exportarImagem = async () => {
    if (!reportRef.current) return

    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2
      })

      const link = document.createElement("a")
      link.download = `relatorio-redec10-${new Date().toLocaleDateString("pt-BR")}.png`
      link.href = dataUrl
      link.click()

    } catch (err) {
      console.error("Erro ao exportar imagem", err)
    }
  }

  // ============================
  // COR DE NÍVEL
  // ============================

  function obterCorNivel(nivel, limite) {
    if (!nivel || !limite) return ""

    const n = parseFloat(nivel)
    const l = parseFloat(limite)

    if (n >= l * 1.2) return "bg-[#ff00ff] text-white"
    if (n >= l) return "bg-[#ff0000] text-white"
    if (n >= l * 0.85) return "bg-[#ffc000] text-black font-black"

    return ""
  }

  // ============================
  // AGRUPAR POR RIO
  // ============================

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

  // ============================
  // RENDER
  // ============================

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[999] p-4 overflow-auto">

      {/* BOTÕES */}
      <div className="fixed top-4 right-4 flex gap-2 z-[1001]">
        <button
          onClick={exportarImagem}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-black text-[12px] uppercase shadow-xl"
        >
          📸 Salvar Foto
        </button>

        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-black text-[12px] uppercase shadow-xl"
        >
          Fechar
        </button>
      </div>

      {/* BORDA BRANCA EXTERNA (AQUI FOI TRIPLICADA) */}
      <div ref={reportRef} className="p-16 bg-white flex flex-col items-center">

        <div className="bg-white border-[4px] border-black flex flex-col w-fit min-w-[900px]">

          {/* TÍTULO */}
          <div className="bg-[#ffc000] border-b-[4px] border-black p-2 text-center">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">
              MONITORAMENTO DOS RIOS - REDEC 10
            </h1>
          </div>

          {/* TABELA */}
          <table className="border-collapse table-auto w-full">

            <thead>
              <tr className="bg-[#8db4e2] text-[14px] uppercase font-black text-center">

                <th className="border-2 border-black p-2 w-[140px]">
                  RIOS / LAGOAS
                </th>

                <th className="border-2 border-black p-2">
                  MUNICÍPIOS / ESTAÇÃO
                </th>

                <th className="border-2 border-black p-2 bg-[#ffffcc] text-red-700 w-[90px]">
                  TRANSB.
                </th>

                {cabecalho.map((h, i) => (
                  <th key={i} className="border-2 border-black p-2 w-[85px]">
                    {h}
                  </th>
                ))}

                <th className="border-2 border-black p-2 w-[80px]">
                  FONTE
                </th>

              </tr>
            </thead>

            <tbody>

              {nomesRiosOrdenados.map((rio) => {
                const lista = estacoesAgrupadas[rio]

                return lista.map((estacao, idx) => {

                  const d = dados[estacao.id] || {}
                  const limite = estacao.nivel_transbordo

                  const colunas = [
                    d.h12,
                    d.h8,
                    d.h4,
                    d.ref
                  ]

                  // 🔥 AGORA CORRETO (VEM DO BANCO)
                  const fonte = estacao.fonte || "-"

                  return (
                    <tr key={estacao.id} className="text-center font-black text-[16px] leading-none">

                      {idx === 0 && (
                        <td
                          rowSpan={lista.length}
                          className="border-2 border-black bg-[#d9e1f2] text-[14px] px-1"
                        >
                          {rio}
                        </td>
                      )}

                      <td className="border-2 border-black text-left px-2 text-[14px]">
                        {estacao.municipio}
                      </td>

                      <td className="border-2 border-black text-red-600 bg-[#ffffcc] text-[15px]">
                        {limite
                          ? parseFloat(limite).toFixed(2).replace(".", ",")
                          : "—"}
                      </td>

                      {colunas.map((c, i) => (
                        <td
                          key={i}
                          className={`border-2 border-black text-[18px] ${obterCorNivel(c?.nivel, limite)}`}
                        >
                          {c?.nivel
                            ? parseFloat(c.nivel).toFixed(2).replace(".", ",")
                            : "—"}
                        </td>
                      ))}

                      <td className="border-2 border-black text-[12px] uppercase">
                        {fonte}
                      </td>

                    </tr>
                  )
                })
              })}

            </tbody>

          </table>

          {/* RODAPÉ */}
          <div className="p-3 border-t-[3px] border-black">

            <div className="flex gap-10 justify-center mb-2">

              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 bg-[#ffc000] border-2 border-black"></div>
                <span className="text-[12px] font-black">ALERTA</span>
              </div>

              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 bg-[#ff0000] border-2 border-black"></div>
                <span className="text-[12px] font-black">TRANSBORDO</span>
              </div>

              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 bg-[#ff00ff] border-2 border-black"></div>
                <span className="text-[12px] font-black">20% ACIMA</span>
              </div>

            </div>

            <p className="text-[10px] text-center font-bold italic">
              ANA - Agência Nacional de Águas | INEA - Instituto Estadual do Ambiente | COMDEC
            </p>

          </div>

        </div>
      </div>
    </div>
  )
}
