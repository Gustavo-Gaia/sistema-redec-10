/* app/(sistema)/dashboard/page.js */

"use client"

import { useState, useEffect } from "react"
import { Waves, FileText, Users, AlertTriangle, Calendar, Package, Ambulance, Landmark } from "lucide-react"
import Link from "next/link"
import { useMonitoramento } from "../monitoramento/MonitoramentoContext"
import { supabase } from "@/lib/supabase"
import { parseISO, isWithinInterval, startOfDay, isBefore } from "date-fns"

// Helpers de verificação acima do componente
const safeParse = (dateString) => {
  if (!dateString) return null
  return parseISO(`${dateString}T00:00:00`)
}

function verificarAtivoDashboard(militar) {
  if (!militar.ativo) return false

  if (militar.data_saida_redec) {
    const hoje = startOfDay(new Date())
    const dataSaida = safeParse(militar.data_saida_redec)

    if (isBefore(dataSaida, hoje)) {
      return false
    }
  }

  return true
}

export default function Dashboard() {
  const { estacoes } = useMonitoramento()
  const [saldoContainer, setSaldoContainer] = useState({ colchoes: 0, kits: 0 })
  const [statsAgenda, setStatsAgenda] = useState({ mes: 0, semana: 0 })
  const [statsBoletins, setStatsBoletins] = useState({ 
    prazosSemana: 0, 
    leituraSEDEC: "...", 
    leituraDGDEC: "..." 
  })
  
  const [statsEquipe, setStatsEquipe] = useState({
    disponiveis: 0,
    afastados: 0
  })

  // Estado para o controle dinâmico de viaturas com os novos alertas e textos limpos
  const [statsViaturas, setStatsViaturas] = useState({
    frota: "00 viaturas",
    emServicoTexto: "Nenhuma viatura",
    temInoperante: false
  })

  // Estado dinâmico para o controle de Patrimônio
  const [statsPatrimonio, setStatsPatrimonio] = useState({
    cargaOperacional: "0 bens",
    inserviveisTexto: "Nenhum item inservível",
    temInservivel: false
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
        const sedec = leituras.find(l => l.tipo_orgao === 'SEDEC')?.visto_ate || "---"
        const dgdec = leituras.find(l => l.tipo_orgao === 'DGDEC')?.visto_ate || "---"
        
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

      // 4. Busca da Equipe, Viaturas e Patrimônio em Paralelo trazendo apenas colunas necessárias
      try {
        const [
          { data: militares },
          { data: afastamentos },
          { data: dadosViaturas },
          { data: dadosPatrimonio }
        ] = await Promise.all([
          supabase.from("equipe").select("id, ativo, data_saida_redec"),
          supabase.from("equipe_afastamentos").select("equipe_id, data_inicio, data_fim"),
          supabase.from("viaturas").select("prefixo, situacao"),
          supabase.from("patrimonio").select("condicao")
        ])

        if (militares && afastamentos) {
          const hoje = startOfDay(new Date())
          const militaresAtivos = militares.filter(verificarAtivoDashboard)

          let disponiveis = 0
          let afastadosHoje = 0

          militaresAtivos.forEach((militar) => {
            const afastado = afastamentos.some((af) => {
              if (af.equipe_id !== militar.id) return false

              const inicio = safeParse(af.data_inicio)
              const fim = safeParse(af.data_fim)

              return (
                inicio &&
                fim &&
                isWithinInterval(hoje, {
                  start: inicio,
                  end: fim
                })
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

        // Processamento inteligente e limpo das viaturas
        if (dadosViaturas) {
          const totalFrota = dadosViaturas.length
          const operantes = dadosViaturas.filter(v => v.situacao?.toUpperCase() === "OPERANTE")
          const totalOperantes = operantes.length
          
          // Verificação se existe qualquer viatura com status diferente de OPERANTE
          const temInoperante = dadosViaturas.some(v => v.situacao?.toUpperCase() !== "OPERANTE")

          const sufixoFrota = totalFrota === 1 ? "viatura" : "viaturas"
          const sufixoOperante = totalOperantes === 1 ? "viatura" : "viaturas"

          let textoServico = "Nenhuma viatura"
          if (totalOperantes > 0) {
            // Limita a exibição de prefixos em no máximo 3 itens para não quebrar o layout
            const prefixosLimitados = operantes.slice(0, 3).map(v => v.prefixo).join(", ")
            const sufixoReticencias = totalOperantes > 3 ? "..." : ""
            const totalFormatado = totalOperantes < 10 ? `0${totalOperantes}` : totalOperantes

            textoServico = `${totalFormatado} ${sufixoOperante} (${prefixosLimitados}${sufixoReticencias})`
          }

          setStatsViaturas({
            frota: `${totalFrota < 10 ? '0' + totalFrota : totalFrota} ${sufixoFrota}`,
            emServicoTexto: textoServico,
            temInoperante
          })
        }

        // Processamento analítico do Patrimônio baseado nos códigos do módulo
        if (dadosPatrimonio) {
          const totalOperacionais = dadosPatrimonio.filter(b => 
            ["Em uso", "Acautelado", "Armazenado"].includes(b.condicao)
          ).length

          const totalInserviveis = dadosPatrimonio.filter(b => b.condicao === "Inservível").length
          const temInservivel = totalInserviveis > 0

          const sufixoBens = totalOperacionais === 1 ? "bem" : "bens"
          const textoInservivel = totalInserviveis === 0 
            ? "Nenhum item inservível" 
            : totalInserviveis === 1 
              ? "1 item inservível" 
              : `${totalInserviveis} itens inservíveis`

          setStatsPatrimonio({
            cargaOperacional: `${totalOperacionais} ${sufixoBens}`,
            inserviveisTexto: textoInservivel,
            temInservivel
          })
        }

      } catch (err) {
        console.error("Erro ao computar dados logísticos do dashboard:", err)
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
    { 
      title: "Viaturas", 
      icon: Ambulance, 
      color: "from-cyan-600 to-teal-700", 
      link: "/viaturas", 
      info: [`Frota: ${statsViaturas.frota}`, `Em serviço: ${statsViaturas.emServicoTexto}`] 
    },
    { 
      title: "Patrimônio", 
      icon: Landmark, 
      color: "from-purple-600 to-violet-900", 
      link: "/patrimonio", 
      info: [`Carga operacional: ${statsPatrimonio.cargaOperacional}`, statsPatrimonio.inserviveisTexto] 
    }
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
        const isViaturas = card.title === "Viaturas";
        const isPatrimonio = card.title === "Patrimônio";
        
        const temCriticoMonitoramento = isMonitoramento && contagemMonitoramento.critico > 0;
        const temAlertaEstoque = isContainer && estoqueIncompleto;
        const temPrazoUrgente = isBoletim && statsBoletins.prazosSemana > 0;
        const temAfastados = isEquipe && statsEquipe.afastados > 0;
        const temViaturaInoperante = isViaturas && statsViaturas.temInoperante;
        const temPatrimonioInservivel = isPatrimonio && statsPatrimonio.temInservivel;

        return (
          <Link href={card.link} key={i} className="group block">
            <div className={`
              bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden 
              hover:shadow-xl transition-all hover:-translate-y-1 relative
              ${temCriticoMonitoramento ? 'ring-2 ring-red-500 ring-offset-2' : ''}
              ${temAlertaEstoque ? 'ring-2 ring-amber-500 ring-offset-2' : ''}
              ${temPrazoUrgente ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              ${temAfastados ? 'ring-2 ring-amber-500 ring-offset-2' : ''} 
              ${temViaturaInoperante ? 'ring-2 ring-red-500 ring-offset-2' : ''} 
              ${temPatrimonioInservivel ? 'ring-2 ring-red-500 ring-offset-2' : ''} 
            `}>
              
              <div className={`p-4 bg-gradient-to-br ${card.color} text-white flex items-center gap-3`}>
                <div className="p-2 bg-white/20 rounded-lg"><Icon size={24} /></div>
                <span className="font-bold text-lg">{card.title}</span>
                
                {(temCriticoMonitoramento || temAlertaEstoque || temPrazoUrgente || temAfastados || temViaturaInoperante || temPatrimonioInservivel) && (
                  <span className="ml-auto flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${
                      temCriticoMonitoramento || temViaturaInoperante || temPatrimonioInservivel ? 'bg-red-400' : temAlertaEstoque || temAfastados ? 'bg-amber-400' : 'bg-blue-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      temCriticoMonitoramento || temViaturaInoperante || temPatrimonioInservivel ? 'bg-red-500' : temAlertaEstoque || temAfastados ? 'bg-amber-500' : 'bg-blue-500'
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
                  const isLinhaAfastados = isEquipe && line.includes("Afastados") && statsEquipe.afastados > 0;
                  const isLinhaViaturaProblema = isViaturas && line.includes("Em serviço") && statsViaturas.temInoperante;
                  
                  // Nova estilização de destaque para bens inservíveis identificados
                  const isLinhaPatrimonioProblema = isPatrimonio && line.includes("inservível") && statsPatrimonio.temInservivel;
                  
                  const isDestaqueAgenda = isAgenda && 
                                          !line.includes("Nada agendado") && 
                                          !line.includes("atividades no mês") && 
                                          !line.includes("atividade este mês");

                  return (
                    <div key={j} className="flex items-center gap-2">
                      <div className={`
                        w-1.5 h-1.5 rounded-full 
                        ${isLinhaCritica || isLinhaViaturaProblema || isLinhaPatrimonioProblema ? 'bg-red-500' : 
                          isLinhaAlertaMonit || isLinhaEstoqueBaixo || isLinhaAfastados ? 'bg-amber-500' : 
                          isLinhaPrazoBoletim || isDestaqueAgenda ? 'bg-blue-500' : 'bg-slate-300'}
                        ${isLinhaCritica ? 'animate-pulse' : ''}
                      `} />
                      <p className={`
                        ${isLinhaCritica || isLinhaViaturaProblema || isLinhaPatrimonioProblema ? "text-red-600 font-bold" : ""}
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
