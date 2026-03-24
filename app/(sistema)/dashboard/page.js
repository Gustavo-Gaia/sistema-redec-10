/* app/(sistema)/dashboard/page.js */

"use client"

import { Waves, FileText, Users, AlertTriangle, Calendar, Package, Ambulance, Landmark } from "lucide-react"
import Link from "next/link"
import { useMonitoramento } from "../monitoramento/MonitoramentoContext"

export default function Dashboard() {
  // Puxamos as estações que o Provider já está monitorando via Supabase
  const { estacoes } = useMonitoramento()

  // Calculamos as contagens em tempo real baseado no status de cada estação
  const contagemMonitoramento = estacoes.reduce(
    (acc, estacao) => {
      const status = estacao.situacao?.status
      if (status === "alerta") {
        acc.alerta++
      } else if (["transbordo", "extremo"].includes(status)) {
        acc.critico++
      }
      return acc
    },
    { alerta: 0, critico: 0 }
  )

  const cards = [
    { 
      title: "Monitoramento", 
      icon: Waves, 
      color: "from-green-600 to-emerald-800", 
      link: "/monitoramento", 
      // Dados reais substituindo os fixos
      info: [
        `Nível de Alerta: ${contagemMonitoramento.alerta}`, 
        `Nível Crítico: ${contagemMonitoramento.critico}`
      ] 
    },
    { title: "Boletins e SEI", icon: FileText, color: "from-blue-600 to-blue-900", link: "/boletins", info: ["Pendências: 5", "Último: 24/04"] },
    { title: "Equipe REDEC", icon: Users, color: "from-orange-500 to-orange-800", link: "/equipe", info: ["Servidores: 42", "Em campo: 4"] },
    { title: "Ocorrências", icon: AlertTriangle, color: "from-red-500 to-red-900", link: "/comdecs", info: ["Afetados: 5", "Desalojados: 208"] },
    { title: "Agenda", icon: Calendar, color: "from-slate-600 to-slate-900", link: "/agenda", info: ["Atividades: 12", "Reuniões: 2"] },
    { title: "Contêiner", icon: Package, color: "from-purple-500 to-purple-900", link: "/container", info: ["Estoque: OK", "Última saída: Ontem"] },
    { title: "Viaturas", icon: Ambulance, color: "from-slate-600 to-slate-800", link: "/viaturas", info: ["Frota: 8", "Em serviço: 3"] },
    { title: "Patrimônio", icon: Landmark, color: "from-purple-600 to-violet-900", link: "/patrimonio", info: ["Bens: 154", "Auditoria: 100%"] }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isMonitoramento = card.title === "Monitoramento";
        const temCritico = isMonitoramento && contagemMonitoramento.critico > 0;

        return (
          <Link href={card.link} key={i} className="group block">
            <div className={`
              bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden 
              hover:shadow-xl transition-all hover:-translate-y-1 relative
              ${temCritico ? 'ring-2 ring-red-500 ring-offset-2' : ''}
            `}>
              
              {/* Header do Card */}
              <div className={`p-4 bg-gradient-to-br ${card.color} text-white flex items-center gap-3`}>
                <div className="p-2 bg-white/20 rounded-lg"><Icon size={24} /></div>
                <span className="font-bold text-lg">{card.title}</span>
                
                {/* Indicador visual de urgência no topo do card */}
                {temCritico && (
                  <span className="ml-auto flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>

              {/* Corpo do Card */}
              <div className="p-5 text-slate-600 text-sm space-y-2 font-medium">
                {card.info.map((line, j) => {
                  const isLinhaCritica = isMonitoramento && line.includes("Crítico") && contagemMonitoramento.critico > 0;
                  const isLinhaAlerta = isMonitoramento && line.includes("Alerta") && contagemMonitoramento.alerta > 0;

                  return (
                    <div key={j} className="flex items-center gap-2">
                      <div className={`
                        w-1.5 h-1.5 rounded-full 
                        ${isLinhaCritica ? 'bg-red-500 animate-pulse' : isLinhaAlerta ? 'bg-amber-500' : 'bg-slate-300'}
                      `} />
                      <p className={isLinhaCritica ? "text-red-600 font-bold" : ""}>
                        {line}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
