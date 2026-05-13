/* app/(sistema)/patrimonio/componentes/CardPatrimonio.js */

"use client"

import { 
  MapPin, 
  Tag, 
  Box, 
  AlertTriangle, 
  CheckCircle2, 
  Archive, 
  ShieldCheck, 
  XCircle,
  FileText
} from "lucide-react"

export default function CardPatrimonio({ bem, onClick }) {
  
  const statusConfig = {
    "Em uso": {
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      dot: "bg-emerald-500",
      hover: "hover:border-emerald-300"
    },
    "Acautelado": {
      color: "text-blue-600 bg-blue-50 border-blue-100",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      dot: "bg-blue-500",
      hover: "hover:border-blue-300"
    },
    "Armazenado": {
      color: "text-amber-600 bg-amber-50 border-amber-100",
      icon: <Archive className="w-3.5 h-3.5" />,
      dot: "bg-amber-500",
      hover: "hover:border-amber-300"
    },
    "Inservível": {
      color: "text-orange-600 bg-orange-50 border-orange-100",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      dot: "bg-orange-500",
      hover: "hover:border-orange-300"
    },
    "Baixa Definitiva": {
      color: "text-slate-600 bg-slate-100 border-slate-200", // Voltando para o Cinza
      icon: <XCircle className="w-3.5 h-3.5" />,
      dot: "bg-slate-400",
      hover: "hover:border-slate-400"
    }
  }

  const config = statusConfig[bem.condicao] || statusConfig["Armazenado"]

  return (
    <div 
      onClick={onClick}
      className={`
        group bg-white rounded-3xl p-5 border border-slate-200 
        shadow-sm hover:shadow-xl transition-all cursor-pointer 
        relative overflow-hidden flex flex-col justify-between
        min-h-[200px] ${config.hover}
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.dot}`} />

      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
            <Box className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
            {config.icon}
            {bem.condicao}
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-black text-slate-800 leading-tight uppercase text-sm group-hover:text-slate-900 transition-colors">
            {bem.nome_bem}
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-600 tracking-tight">
                Nº Patrimonial: {bem.num_patrimonial}
              </span>
            </div>
            
            {bem.observacoes && (
              <div className="flex items-center gap-1 text-amber-500 animate-pulse">
                <FileText className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase">Obs</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
              <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
              <span className="truncate">{bem.localizacao || "N/D"}</span>
            </div>
          </div>
          
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Propriedade</span>
            <span className="text-[11px] font-bold text-slate-600 truncate uppercase">
              {bem.propriedade}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
        <Box size={120} strokeWidth={1} />
      </div>
    </div>
  )
}
