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

export default function IndicadoresPatrimonio({ bens, filtroCondicao, setFiltroCondicao }) {
  
  // Lógica de contagem baseada na lista total vinda do Supabase
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
      id: "Todos",
      label: "Total de Bens",
      valor: statsData.total,
      icon: Box,
      color: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200",
      activeRing: "ring-slate-400"
    },
    {
      id: "Em uso",
      label: "Em Uso",
      valor: statsData.emUso,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      activeRing: "ring-emerald-500"
    },
    {
      id: "Acautelado",
      label: "Acautelado",
      valor: statsData.acautelado,
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      activeRing: "ring-blue-500"
    },
    {
      id: "Armazenado",
      label: "Armazenado",
      valor: statsData.armazenado,
      icon: Archive,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      activeRing: "ring-amber-500"
    },
    {
      id: "Inservível",
      label: "Inservível",
      valor: statsData.inservivel,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
      activeRing: "ring-orange-500"
    },
    {
      id: "Baixa Definitiva",
      label: "Baixa Definitiva",
      valor: statsData.baixa,
      icon: XCircle,
      color: "text-slate-500",
      bg: "bg-slate-100",
      border: "border-slate-200",
      activeRing: "ring-slate-500"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((item) => {
        const isActive = filtroCondicao === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setFiltroCondicao(item.id)}
            className={`
              text-left transition-all duration-200
              bg-white p-4 rounded-[1.5rem] border shadow-sm 
              flex flex-col sm:flex-row items-center gap-3
              hover:shadow-md hover:-translate-y-0.5 active:scale-95
              ${isActive 
                ? `ring-2 ${item.activeRing} border-transparent shadow-md` 
                : `${item.border} border-slate-200 opacity-70 hover:opacity-100`
              }
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
          </button>
        )
      })}
    </div>
  )
}
