/* app/(sistema)/patrimonio/componentes/CardPatrimonio.js */

"use client"

import { MapPin, Tag, Box, AlertTriangle, CheckCircle2, Archive } from "lucide-react"

export default function CardPatrimonio({ bem, onClick }) {
  
  // Lógica de Cores e Ícones baseada na Condição
  const statusConfig = {
    "Em uso": {
      color: "text-blue-600 bg-blue-50 border-blue-100",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      dot: "bg-blue-500"
    },
    "Armazenado": {
      color: "text-amber-600 bg-amber-50 border-amber-100",
      icon: <Archive className="w-3.5 h-3.5" />,
      dot: "bg-amber-500"
    },
    "Inservível": {
      color: "text-red-600 bg-red-50 border-red-100",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      dot: "bg-red-500"
    }
  }

  const config = statusConfig[bem.condicao] || statusConfig["Armazenado"]

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Indicador Lateral de Status (Sutil) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.dot}`} />

      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors">
          <Box className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
        </div>
        
        {/* Badge de Condição */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
          {config.icon}
          {bem.condicao}
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <h3 className="font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
          {bem.nome_bem}
        </h3>
        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
          <Tag className="w-3 h-3" />
          <span>Patrimônio: <span className="text-slate-600">{bem.num_patrimonial}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Localização</span>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate">{bem.localizacao || "Não definida"}</span>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Propriedade</span>
          <span className="text-xs font-semibold text-slate-600 truncate">{bem.propriedade}</span>
        </div>
      </div>

      {/* Efeito Visual de Hover no Fundo */}
      <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Box size={100} />
      </div>
    </div>
  )
}
