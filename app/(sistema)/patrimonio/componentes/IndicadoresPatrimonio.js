/* app/(sistema)/patrimonio/componentes/IndicadoresPatrimonio.js */

"use client"

import { Box, CheckCircle2, Archive, AlertTriangle } from "lucide-react"

export default function IndicadoresPatrimonio({ bens }) {
  // Lógica de contagem
  const total = bens.length
  const emUso = bens.filter(b => b.condicao === "Em uso").length
  const armazenado = bens.filter(b => b.condicao === "Armazenado").length
  const inservivel = bens.filter(b => b.condicao === "Inservível").length

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
      label: "Inservível",
      valor: inservivel,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100"
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, index) => (
        <div 
          key={index}
          className={`bg-white p-4 rounded-2xl border ${item.border} shadow-sm flex items-center gap-4 transition-all hover:shadow-md`}
        >
          <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
            <item.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
              {item.label}
            </p>
            <p className={`text-2xl font-black leading-none ${item.color}`}>
              {item.valor}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
