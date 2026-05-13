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
  // Lógica de contagem individualizada
  const statsData = {
    total: bens.length,
    emUso: bens.filter(b => b.condicao === "Em uso").length,
    acautelado: bens.filter(b => b.condicao === "Acautelado").length,
    armazenado: bens.filter(b => b.condicao === "Armazenado").length,
    inservivel: bens.filter(b => b.condicao === "Inservível").length,
    baixa: bens.filter(b => b.condicao === "Baixa Definitiva").length,
  }

  const stats = [
    {
      label: "Total de Bens",
      valor: statsData.total,
      icon: Box,
      color: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200"
    },
    {
      label: "Em Uso",
      valor: statsData.emUso,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      label: "Acautelado",
      valor: statsData.acautelado,
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      label: "Armazenado",
      valor: statsData.armazenado,
      icon: Archive,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      label: "Inservível",
      valor: statsData.inservivel,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100"
    },
    {
      label: "Baixa Definitiva",
      valor: statsData.baixa,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((item, index) => (
        <div 
          key={index}
          className={`
            bg-white p-4 rounded-[1.5rem] border ${item.border} 
            shadow-sm flex flex-col sm:flex-row items-center gap-3 
            transition-all hover:shadow-md hover:-translate-y-0.5
          `}
        >
          <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} shrink-0`}>
            <item.icon className="w-5 h-5" />
          </div>
          
          <div className="text-center sm:text-left min-w-0">
            <p className="text-[9px] font-black uppercase tracking-tight text-slate-400 leading-none mb-1.5 truncate">
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
