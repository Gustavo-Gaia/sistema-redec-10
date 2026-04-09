/* app/(sistema)/dashboard/page.js */

"use client"

import { useState, useEffect } from "react"
import { Waves, FileText, Users, AlertTriangle, Calendar, Package, Ambulance, Landmark } from "lucide-react"
import Link from "next/link"
import { useMonitoramento } from "../monitoramento/MonitoramentoContext"
import { supabase } from "@/lib/supabase"

export default function Dashboard() {
  const { estacoes } = useMonitoramento()
  const [saldoContainer, setSaldoContainer] = useState({ colchoes: 0, kits: 0 })
  const [statsAgenda, setStatsAgenda] = useState({ mes: 0, semana: 0 })

  useEffect(() => {
    async function buscarDados() {
      // 1. Busca Saldo do Contêiner
      const { data: dataContainer } = await supabase.from('saldo_humanitario').select('*').single()
      if (dataContainer) {
        setSaldoContainer({
          colchoes: dataContainer.colchoes || 0,
          kits: dataContainer.kits || 0
        })
      }

      // 2. Busca Eventos Reais (Tabela: agenda_eventos)
      const { data: eventos, error } = await supabase
        .from('agenda_eventos')
        .select('data_inicio')
      
      if (eventos && !error) {
        const hoje = new Date()
        
        // --- Lógica da Semana (Segunda a Domingo) ---
        const diaSemana = hoje.getDay()
        const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
        const segunda = new Date(hoje)
        segunda.setDate(hoje.getDate() + diffSegunda)
        segunda.setHours(0, 0, 0, 0)

        const domingo = new Date(segunda)
        domingo.setDate(segunda.getDate() + 6)
        domingo.setHours(23, 59, 59, 999)

        // --- Filtros ---
        const contagemMes = eventos.filter(ev => {
          const d = new Date(ev.data_inicio)
          return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear()
        }).length

        const contagemSemana = eventos.filter(ev => {
          const d = new Date(ev.data_inicio)
          return d >= segunda && d <= domingo
        }).length

        setStatsAgenda({ mes: contagemMes, semana: contagemSemana })
      }
    }
    
    buscarDados()
  }, [])

  const contagemMonitoramento = estacoes.reduce(
    (acc, estacao) => {
      const status = estacao.situacao?.status
      if (status === "alerta") acc.alerta++
      else if (["transbordo", "extremo"].includes(status)) acc.critico++
      return acc
    },
    { alerta: 0, critico: 0 }
  )

  const estoqueIncompleto = saldoContainer.colchoes < 102 || saldoContainer.kits < 102

  const cards = [
    { 
      title: "Monitoramento", 
      icon: Waves, 
      color: "from-green-600 to-emerald-800", 
      link: "/monitoramento", 
      info: [`Nível de Alerta: ${contagemMonitoramento.alerta}`, `Nível Crítico: ${contagemMonitoramento.critico}`] 
    },
    { title: "Boletins e SEI", icon: FileText, color: "from-blue-600 to-blue-900", link: "/boletins", info: ["Pendências: 5", "Último: 24/04"] },
    { title: "Equipe REDEC", icon: Users, color: "from-orange-500 to-orange-800", link: "/equipe", info: ["Servidores: 42", "Em campo: 4"] },
    { title: "Ocorrências", icon: AlertTriangle, color: "from-red-500 to-red-900", link: "/comdecs", info: ["Afetados: 5", "Desalojados: 208"] },
    { 
      title: "Agenda", 
      icon: Calendar, 
      color: "from-slate-600 to-slate-900", 
      link: "/agenda", 
      info: [
        `Mês atual: ${statsAgenda.mes} atividades`, 
        `Nesta semana: ${statsAgenda.semana}`
      ] 
    },
    { 
      title: "Contêiner", 
      icon: Package, 
      color: "from-purple-500 to-purple-900", 
      link: "/container", 
      info: [`Colchões: ${saldoContainer.colchoes}/102`, `Kits Dormitório: ${saldoContainer.kits}/102`] 
    },
    { title: "Viaturas", icon: Ambulance, color: "from-slate-600 to-slate-800", link: "/viaturas", info: ["Frota: 8", "Em serviço: 3"] },
    { title: "Patrimônio", icon: Landmark, color: "from-purple-600 to-violet-900", link: "/patrimonio", info: ["Bens: 154", "Auditoria: 100%"] }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isMonitoramento = card.title === "Monitoramento";
        const isContainer = card.title === "Contêiner";
        const isAgenda = card.title === "Agenda";
        
        const temCriticoMonitoramento = isMonitoramento && contagemMonitoramento.critico > 0;
        const temAlertaEstoque = isContainer && estoqueIncompleto;

        return (
          <Link href={card.link} key={i} className="group block">
            <div className={`
              bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden 
              hover:shadow-xl transition-all hover:-translate-y-1 relative
              ${temCriticoMonitoramento ? 'ring-2 ring-red-500 ring-offset-2' : ''}
              ${temAlertaEstoque ? 'ring-2 ring-amber-500 ring-offset-2' : ''}
            `}>
              
              <div className={`p-4 bg-gradient-to-br ${card.color} text-white flex items-center gap-3`}>
                <div className="p-2 bg-white/20 rounded-lg"><Icon size={24} /></div>
                <span className="font-bold text-lg">{card.title}</span>
                {(temCriticoMonitoramento || temAlertaEstoque) && (
                  <span className="ml-auto flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${temCriticoMonitoramento ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${temCriticoMonitoramento ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                  </span>
                )}
              </div>

              <div className="p-5 text-slate-600 text-sm space-y-2 font-medium">
                {card.info.map((line, j) => {
                  const isLinhaCritica = isMonitoramento && line.includes("Crítico") && contagemMonitoramento.critico > 0;
                  const isLinhaAlertaMonit = isMonitoramento && line.includes("Alerta") && contagemMonitoramento.alerta > 0;
                  const isLinhaEstoqueBaixo = isContainer && line.includes("/102") && (
                    (line.includes("Colchões") && saldoContainer.colchoes < 102) || 
                    (line.includes("Kits") && saldoContainer.kits < 102)
                  );
                  // Ponto azul se houver compromisso na semana
                  const isDestaqueAgenda = isAgenda && line.includes("semana") && statsAgenda.semana > 0;

                  return (
                    <div key={j} className="flex items-center gap-2">
                      <div className={`
                        w-1.5 h-1.5 rounded-full 
                        ${isLinhaCritica ? 'bg-red-500 animate-pulse' : 
                          isLinhaAlertaMonit || isLinhaEstoqueBaixo ? 'bg-amber-500' : 
                          isDestaqueAgenda ? 'bg-blue-500' : 'bg-slate-300'}
                      `} />
                      <p className={`
                        ${isLinhaCritica ? "text-red-600 font-bold" : ""}
                        ${isLinhaEstoqueBaixo ? "text-amber-600 font-bold" : ""}
                        ${isDestaqueAgenda ? "text-blue-700 font-bold" : ""}
                      `}>
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
