/* app/(sistema)/container/componentes/TimelineMovimentacoes.js */

"use client"

import { Package, Truck, Paperclip, Trash2, Pencil, Calendar, Clock, X } from "lucide-react"
import { useState } from "react"

export default function TimelineMovimentacoes({
  movimentacoes,
  onDelete,
  onEdit
}) {
  const [preview, setPreview] = useState(null)

  // 🔹 FUNÇÃO DA AGENDA: Ignora o fuso horário e trata a data como texto puro
  function formatarDataSemFuso(dataISO) {
    if (!dataISO) return "Data não informada"
    try {
      const partes = dataISO.includes("T") ? dataISO.split("T") : dataISO.split(" ")
      const dataParte = partes[0] 
      const horaParte = partes[1] || "00:00"

      const [ano, mes, dia] = dataParte.split("-")
      const [hora, minuto] = horaParte.split(":")

      const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ]

      return `${dia} de ${meses[parseInt(mes) - 1]} de ${ano} às ${hora}:${minuto}`
    } catch (error) {
      return "Formato de data inválido"
    }
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Histórico de Movimentações</h2>
          <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded-full uppercase">
            {movimentacoes.length} {movimentacoes.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {movimentacoes.length === 0 && (
            <div className="text-center py-10">
              <Package className="mx-auto text-slate-300 mb-2" size={40} />
              <p className="text-slate-500 text-sm italic">Nenhuma movimentação registrada.</p>
            </div>
          )}

          {movimentacoes.map((mov) => {
            const isEntrada = mov.tipo === "ENTRADA"

            return (
              <div
                key={mov.id}
                className="group relative bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Ícone Estilizado */}
                  <div className={`p-3 rounded-xl shadow-sm ${
                    isEntrada ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                  }`}>
                    {isEntrada ? <Package size={20} /> : <Truck size={20} />}
                  </div>

                  {/* Conteúdo Principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Calendar size={12} />
                      {formatarDataSemFuso(mov.data_hora)}
                    </div>

                    <h3 className="text-slate-800 font-bold truncate">
                      {mov.origem_destino}
                    </h3>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                      <span className="text-slate-600 flex items-center gap-1 font-medium">
                        <Truck size={14} className="text-slate-400" /> {mov.viatura}
                      </span>
                      <span className="text-slate-500">Guia: <span className="text-slate-700 font-mono">{mov.guia}</span></span>
                    </div>

                    {/* Badge de Quantidades */}
                    <div className="mt-3 flex gap-2">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isEntrada ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {isEntrada ? '+' : '-'} {mov.colchao_qtd} Colchões
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isEntrada ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {isEntrada ? '+' : '-'} {mov.kit_dorm_qtd} Kits
                      </div>
                    </div>

                    {/* PDF e Observação */}
                    {mov.arquivo_url && (
                      <button
                        onClick={() => setPreview(mov.arquivo_url)}
                        className="mt-3 flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                      >
                        <Paperclip size={14} />
                        VISUALIZAR GUIA DIGITALIZADA
                      </button>
                    )}

                    {mov.observacao && (
                      <p className="mt-2 text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{mov.observacao}"
                      </p>
                    )}
                  </div>

                  {/* Botões de Ação Lateral */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => onEdit(mov)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(mov.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MODAL DE PREVIEW PDF ESTILIZADO */}
      {preview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between text-slate-800">
              <span className="font-bold flex items-center gap-2">
                <FileText className="text-blue-600" /> Visualização do Documento
              </span>
              <button
                onClick={() => setPreview(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <iframe
              src={preview}
              className="w-full h-full border-none"
              title="Preview"
            />
          </div>
        </div>
      )}
    </>
  )
}
