/* app/(sistema)/monitoramento/componentes/LegendaStatus.js */

export default function LegendaStatus() {

  return (

    <div className="bg-white border rounded-xl p-6">

      <h3 className="font-bold text-slate-800 mb-4">
        Legenda de Situação
      </h3>

      <div className="flex gap-6 text-sm">

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          Normal
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          Alerta
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          Transbordo
        </div>

      </div>

    </div>

  )
}
