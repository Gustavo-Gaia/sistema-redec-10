export default function Dashboard() {
  const cards = [
    { title: "Monitoramento", info: ["Nível Crítico: 3", "Atualização: 10:15"] },
    { title: "Boletins e SEI", info: ["Pendências: 5", "Último: 24/04"] },
    { title: "Equipe REDEC", info: ["Servidores: 42", "Em campo: 4"] },
    { title: "Ocorrências", info: ["Afetados: 5", "Desalojados: 208"] },
    { title: "Agenda", info: ["Atividades: 12", "Reuniões: 2"] },
    { title: "Contêiner", info: ["Estoque: OK", "Última saída: Ontem"] }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sistema Integrado REDEC 10 - Norte</h1>
          <p className="text-slate-600">Defesa Civil - Governo do Estado</p>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition">
          Sair
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white/90 p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition">
            <h3 className="font-bold text-slate-800 text-lg mb-4">{card.title}</h3>
            <div className="text-slate-600 text-sm space-y-2">
              {card.info.map((line, j) => <p key={j}>• {line}</p>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
