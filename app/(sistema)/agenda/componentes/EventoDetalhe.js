/* app/(sistema)/agenda/componentes/EventoDetalhe.js */

"use client"

import { X, Pencil, Trash, Calendar, Clock } from "lucide-react"

export default function EventoDetalhe({ evento, onClose, onEdit, onDelete }) {

  if (!evento) return null

  // FUNÇÃO REVISADA: Trata a data como texto e evita quebra se vier nulo/indefinido
  function formatarDataSemFuso(dataISO) {
    if (!dataISO) return "Data não informada"

    try {
      // Divide por 'T' ou espaço para isolar a data da hora
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER COM A COR DO EVENTO */}
        <div 
          className="p-6 text-white"
          style={{ backgroundColor: evento.cor || "#3b82f6" }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest opacity-80 font-bold">
                Monitoramento REDEC 10
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
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição</label>
            {evento.descricao ? (
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {evento.descricao}
              </p>
            ) : (
              <p className="text-gray-400 italic bg-gray-50/50 p-4 rounded-2xl border border-dashed text-sm">
                Nenhum detalhe adicional para esta atividade.
              </p>
            )}
          </div>

          {/* INFORMAÇÕES DE TEMPO */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 text-gray-700 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Calendar size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Início</span>
                <span className="text-sm font-medium">{formatarDataSemFuso(evento.data_inicio)}</span>
              </div>
            </div>

            {evento.data_fim && (
              <div className="flex items-center gap-3 text-gray-700 bg-orange-50/50 p-3 rounded-2xl border border-orange-100">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Clock size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-orange-400 uppercase">Término Previsto</span>
                  <span className="text-sm font-medium">{formatarDataSemFuso(evento.data_fim)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AÇÕES (FOOTER) - TROCADO PRETO POR AZUL */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50/80">
          
          <button 
            onClick={onDelete}
            className="group flex items-center gap-2 text-red-500 font-bold hover:text-red-700 transition-colors"
          >
            <Trash size={18} />
            Excluir
          </button>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-all"
            >
              Voltar
            </button>
            
            {/* BOTÃO AGORA EM AZUL VIBRANTE (Destaque correto) */}
            <button 
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 font-bold"
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
