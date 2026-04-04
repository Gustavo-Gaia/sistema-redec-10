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
  // FUNÇÃO DE EXPORTAÇÃO
  // ============================
  const exportarImagem = async () => {
    if (!reportRef.current) return
    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 3, // Aumentado para 3 para máxima nitidez em textos pequenos
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
  // LÓGICA DE CORES
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
  // AGRUPAMENTO
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

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[999] p-4 overflow-auto">
      
      {/* BOTÕES FLUTUANTES (Não saem na foto) */}
      <div className="fixed top-6 right-6 flex gap-3 z-[1001]">
        <button 
          onClick={exportarImagem} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black text-sm uppercase shadow-2xl transition-all active:scale-95"
        >
          📸 Gerar Imagem
        </button>
        <button 
          onClick={onClose} 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-sm uppercase shadow-2xl transition-all active:scale-95"
        >
          Fechar
        </button>
      </div>

      {/* ÁREA DE CAPTURA */}
      <div ref={reportRef} className="p-12 bg-white flex flex-col items-center">
        
        {/* CONTAINER DA TABELA (w-fit + border grosso) */}
        <div className="bg-white border-[5px] border-black flex flex-col w-fit shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)]">
          
          {/* CABEÇALHO DO RELATÓRIO */}
          <div className="bg-[#ffc000] border-b-[5px] border-black p-4 text-center">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter whitespace-nowrap">
              MONITORAMENTO DOS RIOS - REDEC 10 Norte / REDEC 11 Noroeste
            </h1>
          </div>

          {/* TABELA - table-auto e whitespace-nowrap nas células críticas */}
          <table className="border-collapse table-auto">
            <thead>
              <tr className="bg-[#8db4e2] text-[13px] uppercase font-black text-center">
                <th className="border-[2px] border-black p-2 w-[110px]">RIOS / LAGOAS</th>
                <th className="border-[2px] border-black p-2">MUNICÍPIOS / ESTAÇÃO</th>
                <th className="border-[2px] border-black p-2 bg-[#ffffcc] text-red-700 w-[80px]">TRANSB.</th>
                {cabecalho.map((h, i) => (
                  <th key={i} className="border-[2px] border-black p-2 w-[75px]">{h}</th>
                ))}
                <th className="border-[2px] border-black p-2 w-[85px]">FONTE</th>
              </tr>
            </thead>

            <tbody>
              {nomesRiosOrdenados.map((rio) => {
                const lista = estacoesAgrupadas[rio]
                return lista.map((estacao, idx) => {
                  const d = dados[estacao.id] || {}
                  const limite = estacao.nivel_transbordo
                  const colunas = [d.h12, d.h8, d.h4, d.ref]

                  return (
                    <tr key={estacao.id} className="text-center font-black text-[16px] leading-tight">
                      {idx === 0 && (
                        <td rowSpan={lista.length} className="border-[2px] border-black bg-[#d9e1f2] text-[12px] px-1 font-bold uppercase">
                          {rio}
                        </td>
                      )}
                      {/* whitespace-nowrap e text-left para municípios não quebrarem linha */}
                      <td className="border-[2px] border-black text-left px-3 text-[14px] whitespace-nowrap uppercase tracking-tighter">
                        {estacao.municipio}
                      </td>
                      <td className="border-[2px] border-black text-red-600 bg-[#ffffcc] text-[16px]">
                        {limite ? parseFloat(limite).toFixed(2).replace(".", ",") : "—"}
                      </td>
                      {colunas.map((c, i) => (
                        <td key={i} className={`border-[2px] border-black text-[20px] ${obterCorNivel(c?.nivel, limite)}`}>
                          {c?.nivel ? parseFloat(c.nivel).toFixed(2).replace(".", ",") : "—"}
                        </td>
                      ))}
                      <td className="border-[2px] border-black text-[10px] px-1 uppercase leading-[1.1]">
                        {estacao.fonte || "-"}
                      </td>
                    </tr>
                  )
                })
              })}
            </tbody>
          </table>

          {/* RODAPÉ E LEGENDA */}
          <div className="p-5 bg-white border-t-[5px] border-black flex flex-col items-center">
            
            {/* Cores */}
            <div className="flex gap-8 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#ffc000] border-2 border-black"></div>
                <span className="text-[13px] font-black uppercase italic">ALERTA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#ff0000] border-2 border-black"></div>
                <span className="text-[13px] font-black uppercase italic">TRANSBORDO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#ff00ff] border-2 border-black"></div>
                <span className="text-[13px] font-black uppercase italic">20% ACIMA</span>
              </div>
            </div>

            {/* Siglas e Observações */}
            <div className="border-[3px] border-black p-3 bg-white w-full max-w-[680px]">
              <p className="text-[11px] font-bold leading-tight text-black italic mb-2 text-center uppercase">
                * Última Medição Válida / N/INF - Não Informado / A/R - Abaixo da régua / INOP - Inoperante / 
                DBM - Destacamento de Bombeiro Militar / COMDEC - Coordenadoria Municipal de Defesa Civil / 
                CPRM - Serviço Geológico do Brasil / ANA - Agência Nacional de Águas / 
                INEA - Instituto Estadual do Ambiente (Sistema Alerta de Cheias)
              </p>
              
              <div className="h-[2px] bg-black mb-2 w-full"></div>
              
              <p className="text-[11px] font-black leading-tight text-black italic text-center">
                Obs.: A dinâmica dos níveis dos rios é calculada com os dados disponíveis no momento, 
                tendo como base as duas últimas cotas, podendo sofrer influência da dificuldade de 
                comunicação entre os colaboradores ou demora na atualização dos aparelhos automáticos.
              </p>
            </div>

            {/* Crédito Institucional */}
            <p className="text-[11px] text-center mt-4 font-black uppercase tracking-[0.2em] bg-black text-white px-4 py-1">
              REDEC 10 - NORTE - DEFESA CIVIL DO ESTADO DO RIO DE JANEIRO
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
