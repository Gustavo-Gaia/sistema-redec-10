/* app/monitoramento/page.js */

export default function Monitoramento() {
  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50">

      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Monitoramento Hidrológico
      </h2>

      <p className="text-slate-600 mb-6">
        Painel de monitoramento dos rios e lagoas da região REDEC 10.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 p-4 rounded-lg border">
          <p className="text-sm text-slate-500">Estações Monitoradas</p>
          <p className="text-2xl font-bold text-slate-800">30</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border">
          <p className="text-sm text-slate-500">Rios Monitorados</p>
          <p className="text-2xl font-bold text-slate-800">5</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border">
          <p className="text-sm text-slate-500">Lagoas Monitoradas</p>
          <p className="text-2xl font-bold text-slate-800">3</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border">
          <p className="text-sm text-slate-500">Situação Atual</p>
          <p className="text-2xl font-bold text-green-600">Normal</p>
        </div>

      </div>

    </div>
  )
}
