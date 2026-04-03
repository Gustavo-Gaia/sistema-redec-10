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

  function obterCorNivel(nivel, limite) {
    if (!nivel || !limite) return ""
    const n = parseFloat(nivel)
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

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[999] p-4 overflow-auto">

      <div className="fixed top-4 right-4 flex gap-2 z-[1001]">
        <button onClick={exportarImagem} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-black text-[12px] uppercase shadow-xl">
          📸 Salvar Foto
        </button>
        <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-black text-[12px] uppercase shadow-xl">
          Fechar
        </button>
      </div>

      {/* MANTIVE O P-16 PARA O RESPIRO BRANCO QUE VOCÊ DESEJA */}
      <div ref={reportRef} className="p-16 bg-white flex flex-col items-center">

        {/* REMOVI O MIN-W-900 PARA A TABELA PODER ESTREITAR */}
        <div className="bg-white border-[4px] border-black flex flex-col w-fit">

          <div className="bg-[#ffc000] border-b-[4px] border-black p-2 text-center">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">
              MONITORAMENTO DOS RIOS - REDEC 10 Norte / REDEC 11 Noroeste
            </h1>
          </div>

          {/* USEI table-fixed PARA MANDAR NAS LARGURAS */}
          <table className="border-collapse table-fixed w-full">
            <thead>
              <tr className="bg-[#8db4e2] text-[14px] uppercase font-black text-center">
                {/* LARGURAS DEFINIDAS PARA ESTREITAR O VISUAL */}
                <th className="border-2 border-black p-2 w-[120px]">RIOS / LAGOAS</th>
                <th className="border-2 border-black p-2 w-[220px]">MUNICÍPIOS / ESTAÇÃO</th>
                <th className="border-2 border-black p-2 bg-[#ffffcc] text-red-700 w-[75px]">TRANSB.</th>
                
                {cabecalho.map((h, i) => (
                  <th key={i} className="border-2 border-black p-2 w-[70px]">{h}</th>
                ))}
                
                <th className="border-2 border-black p-2 w-[80px]">FONTE</th>
              </tr>
            </thead>

            <tbody>
              {nomesRiosOrdenados.map((rio) => {
                const lista = estacoesAgrupadas[rio]
                return lista.map((estacao, idx) => {
                  const d = dados[estacao.id] || {}
                  const limite = estacao.nivel_transbordo
                  const colunas = [d.h12, d.h8, d.h4, d.ref]
                  const fonte = estacao.fonte || "-"

                  return (
                    <tr key={estacao.id} className="text-center font-black text-[16px] leading-none">
                      {idx === 0 && (
                        <td rowSpan={lista.length} className="border-2 border-black bg-[#d9e1f2] text-[14px] px-1">
                          {rio}
                        </td>
                      )}
                      <td className="border-2 border-black text-left px-2 text-[14px]">
                        {estacao.municipio}
                      </td>
                      <td className="border-2 border-black text-red-600 bg-[#ffffcc] text-[15px]">
                        {limite ? parseFloat(limite).toFixed(2).replace(".", ",") : "—"}
                      </td>
                      
                      {colunas.map((c, i) => (
                        <td key={i} className={`border-2 border-black text-[18px] ${obterCorNivel(c?.nivel, limite)}`}>
                          {c?.nivel ? parseFloat(c.nivel).toFixed(2).replace(".", ",") : "—"}
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

          {/* RODAPÉ MANTIDO IGUAL */}
          <div className="p-4 bg-white border-t-[4px] border-black mt-auto">
            <div className="flex gap-10 mb-4 items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#ffc000] border-2 border-black"></div> 
                <span className="text-[13px] font-black uppercase">ALERTA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#ff0000] border-2 border-black"></div> 
                <span className="text-[13px] font-black uppercase">TRANSBORDO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#ff00ff] border-2 border-black"></div> 
                <span className="text-[13px] font-black uppercase">20% ACIMA</span>
              </div>
            </div>
            <div className="border-[2px] border-black p-3 bg-white">
              <p className="text-[11px] font-bold leading-tight text-black italic mb-2 text-center">
                * Última Medição Válida / N/INF / A/R / INOP / DBM / COMDEC / CPRM / ANA / INEA
              </p>
              <div className="h-[2px] bg-black mb-2 w-full"></div>
              <p className="text-[11px] font-black leading-tight text-black italic text-center">
                Obs.: A dinâmica dos níveis dos rios é calculada com os dados disponíveis no momento.
              </p>
            </div>
            <p className="text-[9px] text-center mt-2 font-black uppercase">
              REDEC 10 - NORTE - DEFESA CIVIL DO ESTADO DO RIO DE JANEIRO
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
