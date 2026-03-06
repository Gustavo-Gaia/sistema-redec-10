import { Waves, FileText, Users, AlertTriangle, Calendar, Package, Ambulance, Landmark } from "lucide-react"

export default function Dashboard() {
  const cardsData = [
    { title: "Monitoramento", icon: Waves, color: "green", info: ["Nível Crítico: 3", "Atualização: 10:15"], link: "/rios" },
    { title: "Boletins e SEI", icon: FileText, color: "blue", info: ["Pendências: 5", "Último: 24/04"], link: "/boletins" },
    { title: "Equipe REDEC", icon: Users, color: "orange", info: ["Servidores: 42", "Em campo: 4"], link: "/equipe" },
    { title: "Ocorrências", icon: AlertTriangle, color: "red", info: ["Afetados: 5", "Desalojados: 208"], link: "/comdecs" },
    { title: "Agenda", icon: Calendar, color: "slate", info: ["Atividades: 12", "Reuniões: 2"], link: "/agenda" },
    { title: "Contêiner", icon: Package, color: "purple", info: ["Estoque: OK", "Última saída: Ontem"], link: "/container" },
    { title: "Viaturas", icon: Ambulance, color: "slate", info: ["Frota: 8", "Em serviço: 3"], link: "/viaturas" },
    { title: "Patrimônio", icon: Landmark, color: "purple", info: ["Bens: 154", "Auditoria: 100%"], link: "/patrimonio" },
  ]

  return (
    <>
      <section className="dashboard-hero">
        <h1>Sistema Integrado REDEC 10 - Norte</h1>
        <p>Gestão Estratégica e Defesa Civil Estadual</p>
      </section>

      <div className="cards">
        {cardsData.map((card, index) => (
          <div className="card" key={index}>
            <div className={`card-header-top ${card.color}`}>
              <div className="icon-bg">
                <card.icon size={22} />
              </div>
              <span className="card-title">{card.title}</span>
            </div>
            
            <div className="card-body">
              {card.info.map((text, i) => (
                <div className="info-line" key={i}>
                  <div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1'}}></div>
                  {text}
                </div>
              ))}
            </div>

            <a href={card.link} className="card-footer-btn">
              Saber mais →
            </a>
          </div>
        ))}
      </div>
    </>
  )
}
