/* app/(sistema)/monitoramento/page.js */

import { createClient } from "@supabase/supabase-js"
import { MonitoramentoProvider } from "./MonitoramentoContext"
import TabsMonitoramento from "./TabsMonitoramento"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function Monitoramento() {

  const { data: rios } = await supabase
    .from("rios")
    .select("*")
    .eq("ativo", true)
    .order("nome")

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("*")
    .eq("ativo", true)

  return (

    <MonitoramentoProvider>

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50">

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Monitoramento Hidrológico
        </h2>

        <p className="text-slate-600 mb-6">
          Sistema de acompanhamento das estações hidrológicas da região.
        </p>

        {/* ABAS DO MONITORAMENTO */}

        <TabsMonitoramento
          rios={rios}
          estacoes={estacoes}
        />

      </div>

    </MonitoramentoProvider>

  )
}
