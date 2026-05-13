/* app/(sistema)/patrimonio/componentes/IndicadoresPatrimonio.js */

"use client"

import { 
  Box, 
  CheckCircle2, 
  Archive, 
  AlertTriangle, 
  ShieldCheck, 
  XCircle 
} from "lucide-react"

export default function IndicadoresPatrimonio({ bens }) {
  // Lógica de contagem atualizada
  const total = bens.length
  const emUso = bens.filter(b => b.condicao === "Em uso").length
  const acautelado = bens.filter(b => b.condicao === "Acautelado").length
  const armazenado = bens.filter(b => b.condicao === "Armazenado").length
  
  // Agrupamos Inservível e Baixa Definitiva no indicador de alerta
  const alerta = bens.filter(b => 
    b.condicao === "Inservível" || b.condicao === "Baixa Definitiva"
  ).length

  const stats = [
    {
      label: "Total de Bens",
      valor: total,
      icon: Box,
      color: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200"
    },
    {
      label: "Em Uso",
      valor: emUso,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      label: "Acautelado",
      valor: acautelado,
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      label: "Armazenado",
      valor: armazenado,
      icon: Archive,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      label: "Baixa/Inservível",
      valor: alerta,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((item, index) => (
        <div 
          key={index}
          className={`
            bg-white p-4 rounded-[1.5rem] border ${item.border} 
            shadow-sm flex items-center gap-4 
            transition-all hover:shadow-md hover:-translate-y-0.5
            ${index === 0 ? "col-span-2 md:col-span-1" : ""} 
          `}
        >
          <div className={`p-3 rounded-xl ${item.bg} ${item.color} shrink-0`}>
            <item.icon className="w-5 h-5" />
          </div>
          
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1.5 truncate">
              {item.label}
            </p>
            <p className={`text-xl font-black leading-none ${item.color}`}>
              {item.valor}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
