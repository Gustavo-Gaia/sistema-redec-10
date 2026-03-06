export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Painel Superior Integrado */}
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sistema Integrado REDEC 10 - Norte</h1>
          <p className="text-slate-500">Defesa Civil - Governo do Estado</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition">
          Sair
        </button>
      </header>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Exemplo de card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Monitoramento</h3>
          <div className="text-slate-600 text-sm space-y-2">
            <p>✓ Rios em Nível Normal</p>
            <p>• Atualização: 10:15</p>
          </div>
        </div>
        {/* Repita a estrutura dos outros cards aqui conforme necessário */}
      </div>
    </div>
  )
}
