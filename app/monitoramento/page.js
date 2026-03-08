/* app/monitoramento/page.js */

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function Monitoramento() {

  const { data: rios, error } = await supabase
    .from("rios")
    .select("*")
    .eq("ativo", true)
    .order("nome")

  if (error) {
    console.log("Erro ao buscar rios:", error)
  }

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50">

      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Monitoramento Hidrológico
      </h2>

      <p className="text-slate-600 mb-6">
        Teste de conexão com banco de dados
      </p>

      {/* SELETOR DE RIOS */}
      <div className="mb-8">

        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selecionar Rio
        </label>

        <select className="w-full md:w-80 p-2 border rounded-lg">

          <option>Selecione um rio</option>

          {rios?.map((rio) => (
            <option key={rio.id}>
              {rio.nome}
            </option>
          ))}

        </select>

      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 p-4 rounded-lg border">
          <p className="text-sm text-slate-500">Estações Monitoradas</p>
          <p className="text-2xl font-bold text-slate-800">30</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border">
          <p className="text-sm text-slate-500">Rios Monitorados</p>
          <p className="text-2xl font-bold text-slate-800">
            {rios?.length || 0}
          </p>
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
