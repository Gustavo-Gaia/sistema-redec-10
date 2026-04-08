/* app/(sistema)/agenda/componentes/EventoDetalhe.js */

"use client"

import { X, Pencil, Trash, Calendar, Clock } from "lucide-react"

export default function EventoDetalhe({ evento, onClose, onEdit, onDelete }) {

  if (!evento) return null

  // FUNÇÃO CORRIGIDA: Trata a data como texto para ignorar o fuso horário (UTC)
  function formatarDataSemFuso(dataISO) {
    if (!dataISO) return ""

    try {
      // Exemplo de dataISO: "2026-04-15T10:06:00+00:00" ou "2026-04-15 10:06:00"
      // Vamos separar o "T" ou o espaço para pegar a data e a hora
      const partes = dataISO.includes("T") ? dataISO.split("T") : dataISO.split(" ")
      const dataParte = partes[0] // "2026-04-15"
      const horaParte = partes[1] // "10:06:00..."

      const [ano, mes, dia] = dataParte.split("-")
      const [hora, minuto] = horaParte.split(":")

      const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ]

      return `${dia} de ${meses[parseInt(mes) - 1]} de ${ano} às ${hora}:${minuto}`
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return dataISO
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER COM COR DO EVENTO */}
        <div 
          className="p-6 text-white relative"
          style={{ backgroundColor: evento.cor || "#3b82f6" }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest opacity-80 font-bold">
                Detalhes da Atividade
              </span>
              <h2 className="text-2xl font-bold leading-tight">
                {evento.titulo}
              </h2>
            </div>

            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="p-8 space-y-6">
          
          {/* DESCRIÇÃO */}
          {evento.descricao ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição</label>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {evento.descricao}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 italic">Sem descrição informada.</p>
          )}

          {/* INFORMAÇÕES DE TEMPO */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar size={18} />
              </div>
              <span className="text-sm">
                <strong className="block text-xs text-gray-400 uppercase">Início</strong>
                {formatarDataSemFuso(evento.data_inicio)}
              </span>
            </div>

            {evento.data_fim && (
              <div className="flex items-center gap-3 text-gray-700 border-t pt-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Clock size={18} />
                </div>
                <span className="text-sm">
                  <strong className="block text-xs text-gray-400 uppercase">Previsão de Término</strong>
                  {formatarDataSemFuso(evento.data_fim)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AÇÕES (FOOTER) */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50/50">
          
          <button 
            onClick={onDelete}
            className="group flex items-center gap-2 text-red-500 font-semibold hover:text-red-700 transition-colors"
          >
            <div className="p-2 group-hover:bg-red-50 rounded-lg transition-colors">
              <Trash size={18} />
            </div>
            Excluir
          </button>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-all"
            >
              Fechar
            </button>
            
            <button 
              onClick={onEdit}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-gray-200 transition-all active:scale-95"
            >
              <Pencil size={18} />
              Editar Atividade
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
