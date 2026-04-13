/* app/(sistema)/equipe/componentes/Indicadores.js */

'use client';
import { calcularStatus } from './utils';
import { Users, CheckCircle2, PlaneTakeoff } from "lucide-react";

export default function Indicadores({ militares, afastamentos }) {
  
  // Cálculo em tempo real
  const total = militares.length;
  const disponiveis = militares.filter(m => {
    const m_afastamentos = afastamentos.filter(a => a.equipe_id === m.id);
    return !calcularStatus(m_afastamentos).isAfastado;
  }).length;
  
  const afastados = total - disponiveis;

  const cards = [
    { 
      label: "Efetivo Total", 
      valor: total, 
      icon: Users, 
      cor: "text-slate-600", 
      bg: "bg-slate-100" 
    },
    { 
      label: "Disponíveis Hoje", 
      valor: disponiveis, 
      icon: CheckCircle2, 
      cor: "text-green-600", 
      bg: "bg-green-100" 
    },
    { 
      label: "Afastados/Férias", 
      valor: afastados, 
      icon: PlaneTakeoff, 
      cor: "text-amber-600", 
      bg: "bg-amber-100" 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${card.bg}`}>
            <card.icon className={`w-6 h-6 ${card.cor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="text-2xl font-black text-slate-900">{card.valor}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
