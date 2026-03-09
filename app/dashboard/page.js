/* app/dashboard/page.js */

import { Waves, FileText, Users, AlertTriangle, Calendar, Package, Ambulance, Landmark } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const cards = [
    { title: "Monitoramento", icon: Waves, color: "from-green-600 to-emerald-800", link: "/monitoramento", info: ["Nível Crítico: 3", "Atualização: 10:15"] },
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
        return (
          <Link href={card.link} key={i} className="group block">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
              <div className={`p-4 bg-gradient-to-br ${card.color} text-white flex items-center gap-3`}>
                <div className="p-2 bg-white/20 rounded-lg"><Icon size={24} /></div>
                <span className="font-bold text-lg">{card.title}</span>
              </div>
              <div className="p-5 text-slate-600 text-sm space-y-2">
                {card.info.map((line, j) => <p key={j}>• {line}</p>)}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
