/* app/(sistema)/monitoramento/abas/incendios/MonitoramentoIncendios.js */

"use client"

export default function MonitoramentoIncendios() {
  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Incêndios Florestais e Fogo em Vegetação
        </h2>

        <p className="text-slate-500 mt-2">
          Monitoramento espacial e temporal das ocorrências registradas pelo CBMERJ na área da REDEC 10.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
        <div className="text-5xl mb-4">
          🔥
        </div>

        <h3 className="text-lg font-bold text-slate-700">
          Módulo em construção
        </h3>

        <p className="text-slate-500 mt-2">
          O mapa de calor e os filtros serão exibidos aqui.
        </p>
      </div>

    </div>
  )
}
