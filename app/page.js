export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">Sistema Integrado REDEC 10 - Norte</h1>
        <p className="text-slate-400">Gestão Estratégica e Defesa Civil Estadual</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exemplo de card otimizado */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-slate-800">Monitoramento</h3>
          <div className="mt-4 text-sm text-slate-600 space-y-1">
            <p>• Nível Crítico: 3</p>
            <p>• Atualização: 10:15</p>
          </div>
        </div>
        {/* Adicione os outros cards seguindo este padrão */}
      </div>
    </div>
  )
}
