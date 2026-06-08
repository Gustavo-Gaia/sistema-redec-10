/* app/(sistema)/dashboard/page.js */

"use client"

import { useState, useEffect } from "react"
import { Waves, FileText, Users, AlertTriangle, Calendar, Package, Ambulance, Landmark } from "lucide-react"
import Link from "next/link"
import { useMonitoramento } from "../monitoramento/MonitoramentoContext"
import { supabase } from "@/lib/supabase"
import { isWithinInterval, startOfDay, parseISO } from "date-fns"

// OTIMIZAÇÃO: Importando a função real da equipe para ser a única fonte de verdade
import { verificarSeAtivo } from "../equipe/componentes/utils"

export default function Dashboard() {
  const { estacoes } = useMonitoramento()
  const [saldoContainer, setSaldoContainer] = useState({ colchoes: 0, kits: 0 })
  const [statsAgenda, setStatsAgenda] = useState({ mes: 0, semana: 0 })
  const [statsBoletins, setStatsBoletins] = useState({ 
    prazosSemana: 0, 
    leituraSEDEC: "...", 
    leituraDGDEC: "..." 
  })
  
  // MELHORIA DE UX: Iniciando com "..." para evitar o susto do "0" na tela
  const [statsEquipe, setStatsEquipe] = useState({
    disponiveis: "...",
    afastados: "..."
  })

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

      // 2. Busca Eventos e Prazos Administrativos
      const { data: eventos, error } = await supabase
        .from('agenda_eventos')
        .select('data_inicio, tipo')
      
      if (eventos && !error) {
        const hoje = new Date()
        const diaSemana = hoje.getDay()
        const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
        const segunda = new Date(hoje)
        segunda.setDate(hoje.getDate() + diffSegunda)
        segunda.setHours(0, 0, 0, 0)

        const domingo = new Date(segunda)
        domingo.setDate(segunda.getDate() + 6)
        domingo.setHours(23, 59, 59, 999)

        const contagemMes = eventos.filter(ev => {
          const d = new Date(ev.data_inicio)
          return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear()
        }).length

        const contagemSemana = eventos.filter(ev => {
          const d = new Date(ev.data_inicio)
          return d >= segunda && d <= domingo
        }).length

        const prazosAdmSemana = eventos.filter(ev => {
          const d = new Date(ev.data_inicio)
          return d >= segunda && d <= domingo && ev.tipo === "Administrativo"
        }).length

        setStatsAgenda({ mes: contagemMes, semana: contagemSemana })
        setStatsBoletins(prev => ({ ...prev, prazosSemana: prazosAdmSemana }))
      }

      // 3. Busca Visto Até (SEDEC e DGDEC)
      const { data: leituras } = await supabase.from('controle_leitura_boletins').select('tipo_orgao, visto_ate')
      if (leituras) {
        const sedec = leitures.find(l => l.tipo_orgao === 'SEDEC')?.visto_ate || "---"
        const dgdec = leitures.find(l => l.tipo_orgao === 'DGDEC')?.visto_ate || "---"
        
        const formatarData = (dataStr) => {
          if (dataStr === "---") return "---"
          const [ano, mes, dia] = dataStr.split('-')
          return `${dia}/${mes}`
        }

        setStatsBoletins(prev => ({ 
          ...prev, 
          leituraSEDEC: formatarData(sedec), 
          leituraDGDEC: formatarData(dgdec) 
        }))
      }

      // 4. PERFORMANCE: Busca paralela e enxuta
      try {
        const [
          { data: militares },
          { data: afastamentos }
        ] = await Promise.all([
          supabase.from("equipe").select("id, ativo, data_saida_redec"),
          supabase.from("equipe_afastamentos").select("equipe_id, data_inicio, data_fim")
        ])

        if (militares && afastamentos) {
          const hoje = startOfDay(new Date())
          
          // Usando diretamente a função centralizada do seu módulo equipe
          const militaresAtivos = militares.filter(m => verificarSeAtivo(m))

          let disponiveis = 0
          let afastadosHoje = 0

          militaresAtivos.forEach((militar) => {
            const afastado = afastamentos.some((af) => {
              if (af.equipe_id !== militar.id) return false

              // Normaliza as datas para a checagem do intervalo
              const inicio = af.data_inicio ? parseISO(`${af.data_inicio}T00:00:00`) : null
              const fim = af.data_fim ? parseISO(`${af.data_fim}T00:00:00`) : null

              return (
                inicio &&
                fim &&
                isWithinInterval(hoje, { start: inicio, end: fim })
              )
            })

            if (afastado) {
              afastadosHoje++
            } else {
              disponiveis++
            }
          })

          setStatsEquipe({
            disponiveis,
            afastados: afastadosHoje
          })
        }
      } catch (err) {
        console.error("Erro ao computar dados de equipe:", err)
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
    { 
      title: "Boletins e SEI", 
      icon: FileText, 
      color: "from-blue-600 to-blue-900", 
      link: "/boletins", 
      info: [
        statsBoletins.prazosSemana === 0 ? "Nenhum prazo para esta semana" :
        statsBoletins.prazosSemana === 1 ? "1 documento com prazo na semana" :
        `${statsBoletins.prazosSemana} documentos com prazo na semana`,
        `Leitura: SEDEC (${statsBoletins.leituraSEDEC}) | DGDEC (${statsBoletins.leituraDGDEC})`
      ] 
    },
    { 
      title: "Equipe REDEC", 
      icon: Users, 
      color: "from-orange-500 to-orange-800", 
      link: "/equipe", 
      info: [
        `Disponíveis: ${statsEquipe.disponiveis}`,
        `Afastados/Férias: ${statsEquipe.afastados}`
      ] 
    },
    { title: "Ocorrências", icon: AlertTriangle, color: "from-red-500 to-red-900", link: "/municipios", info: ["Afetados: 5", "Desalojados: 208"] },
    { 
      title: "Agenda", 
      icon: Calendar, 
      color: "from-slate-600 to-slate-900", 
      link: "/agenda", 
      info: [
        statsAgenda.mes === 0 ? "Nenhuma atividade no mês" : 
        statsAgenda.mes === 1 ? "1 atividade este mês" : 
        `${statsAgenda.mes} atividades no mês`,
        
        statsAgenda.semana === 0 ? "Nada agendado esta semana" :
        statsAgenda.semana === 1 ? "1 compromisso esta semana" :
        `${statsAgenda.semana} compromissos na semana`
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
        const isBoletim = card.title === "Boletins e SEI";
        const isEquipe = card.title === "Equipe REDEC";
        
        const temCriticoMonitoramento = isMonitoramento && contagemMonitoramento.critico > 0;
        const temAlertaEstoque = isContainer && estoqueIncompleto;
        const temPrazoUrgente = isBoletim && statsBoletins.prazosSemana > 0;
        
        // O anel de destaque só ativa se o dado já carregou E se houver afastados
        const temAfastados = isEquipe && statsEquipe.afastados !== "..." && statsEquipe.afastados > 0;

        return (
          <Link href={card.link} key={i} className="group block">
            <div className={`
              bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden 
              hover:shadow-xl transition-all hover:-translate-y-1 relative
              ${temCriticoMonitoramento ? 'ring-2 ring-red-500 ring-offset-2' : ''}
              ${temAlertaEstoque ? 'ring-2 ring-amber-500 ring-offset-2' : ''}
              ${temPrazoUrgente ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              ${temAfastados ? 'ring-2 ring-amber-500 ring-offset-2' : ''} 
            `}>
              
              <div className={`p-4 bg-gradient-to-br ${card.color} text-white flex items-center gap-3`}>
                <div className="p-2 bg-white/20 rounded-lg"><Icon size={24} /></div>
                <span className="font-bold text-lg">{card.title}</span>
                
                {(temCriticoMonitoramento || temAlertaEstoque || temPrazoUrgente || temAfastados) && (
                  <span className="ml-auto flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${
                      temCriticoMonitoramento ? 'bg-red-400' : temAlertaEstoque || temAfastados ? 'bg-amber-400' : 'bg-blue-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      temCriticoMonitoramento ? 'bg-red-500' : temAlertaEstoque || temAfastados ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></span>
                  </span>
                )}
              </div>

              <div className="p-5 text-slate-600 text-sm space-y-2 font-medium">
                {card.info.map((line, j) => {
                  const isLinhaCritica = isMonitoramento && line.includes("Crítico") && contagemMonitoramento.critico > 0;
                  const isLinhaAlertaMonit = isMonitoramento && line.includes("Alerta") && contagemMonitoramento.alerta > 0;
                  const isLinhaPrazoBoletim = isBoletim && j === 0 && statsBoletins.prazosSemana > 0;
                  const isLinhaEstoqueBaixo = isContainer && line.includes("/102") && (
                    (line.includes("Colchões") && saldoContainer.colchoes < 102) || 
                    (line.includes("Kits") && saldoContainer.kits < 102)
                  );
                  
                  // Evita destaque falso enquanto carrega ("...")
                  const isLinhaAfastados = isEquipe && line.includes("Afastados") && statsEquipe.afastados !== "..." && statsEquipe.afastados > 0;
                  
                  const isDestaqueAgenda = isAgenda && 
                                          !line.includes("Nada agendado") && 
                                          !line.includes("atividades no mês") && 
                                          !line.includes("atividade este mês");

                  return (
                    <div key={j} className="flex items-center gap-2">
                      <div className={`
                        w-1.5 h-1.5 rounded-full 
                        ${isLinhaCritica ? 'bg-red-500 animate-pulse' : 
                          isLinhaAlertaMonit || isLinhaEstoqueBaixo || isLinhaAfastados ? 'bg-amber-500' : 
                          isLinhaPrazoBoletim || isDestaqueAgenda ? 'bg-blue-500' : 'bg-slate-300'}
                      `} />
                      <p className={`
                        ${isLinhaCritica ? "text-red-600 font-bold" : ""}
                        ${isLinhaEstoqueBaixo || isLinhaAfastados ? "text-amber-600 font-bold" : ""}
                        ${isLinhaPrazoBoletim || isDestaqueAgenda ? "text-blue-700 font-bold" : ""}
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
