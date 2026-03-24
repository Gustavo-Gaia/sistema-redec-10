/* app/(sistema)/monitoramento/abas/InserirMedicoes.js */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import ModalRelatorio from "../componentes/modais/ModalRelatorio"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function InserirMedicoes() {
  const [estacoes, setEstacoes] = useState([])
  const [dados, setDados] = useState({})
  const [idsSelecionados, setIdsSelecionados] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingAna, setLoadingAna] = useState(false)
  const [loadingInea, setLoadingInea] = useState(false)
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false)

  useEffect(() => {
    carregarEstacoes()
  }, [])

  async function carregarEstacoes() {
    const { data } = await supabase
      .from("estacoes")
      .select(`
        id,
        municipio,
        fonte,
        rio_id,
        nivel_transbordo,
        rios(nome)
      `)
      .eq("ativo", true)
      // 🚀 ORDENAÇÃO GEOGRÁFICA FIXA:
      // Ordenamos por ID para garantir que Italva (11) e outros fiquem sempre no curso correto do rio.
      .order('id', { ascending: true })

    setEstacoes(data || [])
    // Seleciona todas automaticamente para o relatório
    setIdsSelecionados(data?.map(e => e.id) || [])
  }

  function toggleSelecao(id) {
    setIdsSelecionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function toggleTodos() {
    if (idsSelecionados.length === estacoes.length) {
      setIdsSelecionados([])
    } else {
      setIdsSelecionados(estacoes.map(e => e.id))
    }
  }

  function atualizarCampo(id, campo, valor) {
    setDados((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor
      }
    }))
  }

  async function buscarANA() {
    setLoadingAna(true)
    try {
      const resp = await fetch("/api/ana")
      const json = await resp.json()
      const novos = { ...dados }
      json.forEach((m) => {
        novos[m.estacao_id] = {
          data: m.data,
          hora: m.hora,
          nivel: m.nivel,
          abaixo_regua: false,
          fonte: "ANA"
        }
      })
      setDados(novos)
    } catch {
      alert("Erro ao buscar dados da ANA")
    }
    setLoadingAna(false)
  }

  async function buscarINEA() {
    setLoadingInea(true)
    try {
      const resp = await fetch("/api/inea")
      const json = await resp.json()
      const novos = { ...dados }
      json.forEach((m) => {
        novos[m.estacao_id] = {
          data: m.data,
          hora: m.hora,
          nivel: m.nivel,
          abaixo_regua: false,
          fonte: "INEA"
        }
      })
      setDados(novos)
    } catch {
      alert("Erro ao buscar dados do INEA")
    }
    setLoadingInea(false)
  }

  async function salvarMedicoes() {
    setLoading(true)
    const registros = []
    estacoes.forEach((estacao) => {
      const d = dados[estacao.id]
      if (!d || !d.data || !d.hora) return
      registros.push({
        estacao_id: estacao.id,
        data: d.data,
        hora: d.hora,
        nivel: d.abaixo_regua ? null : d.nivel,
        abaixo_regua: d.abaixo_regua,
        fonte: d.fonte || "COMDEC"
      })
    })

    if (registros.length === 0) {
      alert("Preencha ao menos uma medição (Data e Hora são obrigatórios).")
      setLoading(false)
      return
    }

    try {
      const resp = await fetch("/api/salvar-medicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registros)
      })
      const r = await resp.json()
      alert(`Sucesso! Inseridos: ${r.inseridos} | Ignorados: ${r.ignorados}`)
      setDados({})
    } catch {
      alert("Falha ao salvar medições no banco de dados.")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* HEADER DE AÇÕES */}
      <div className="flex flex-wrap items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Inserir Medições</h3>
          <p className="text-sm text-slate-500">Gestão de dados reais para REDEC 10 - Norte</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={buscarANA} disabled={loadingAna} className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:bg-white hover:shadow-sm disabled:opacity-50 text-green-700">
              {loadingAna ? "..." : "Sincronizar ANA"}
            </button>
            <button onClick={buscarINEA} disabled={loadingInea} className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:bg-white hover:shadow-sm disabled:opacity-50 text-purple-700">
              {loadingInea ? "..." : "Sincronizar INEA"}
            </button>
          </div>

          <button 
            onClick={() => setMostrarRelatorio(true)} 
            className="bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 flex gap-2 items-center"
          >
            Gerar Relatório ({idsSelecionados.length})
          </button>

          <button onClick={salvarMedicoes} disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold transition-all">
            {loading ? "Processando..." : "Salvar no Banco"}
          </button>
        </div>
      </div>

      {/* TABELA DE DADOS */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-black">
              <th className="p-4 text-center w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  checked={idsSelecionados.length === estacoes.length && estacoes.length > 0}
                  onChange={toggleTodos}
                />
              </th>
              <th className="p-4">Estação / Rio</th>
              <th className="p-4 text-center">Data</th>
              <th className="p-4 text-center">Hora</th>
              <th className="p-4 text-center">Abaixo Régua</th>
              <th className="p-4 text-center">Nível (m)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {estacoes.map((estacao) => {
              const registro = dados[estacao.id] || {}
              const ehComdec = estacao.fonte === "COMDEC"
              const estaSelecionada = idsSelecionados.includes(estacao.id)

              return (
                <tr key={estacao.id} className={`group transition-colors ${estaSelecionada ? 'bg-orange-50/20' : 'hover:bg-slate-50'}`}>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                      checked={estaSelecionada}
                      onChange={() => toggleSelecao(estacao.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{estacao.municipio}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">{estacao.rios?.nome}</span>
                        {ehComdec && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-bold uppercase">Comdec</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <input type="date" className="border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none" value={registro.data || ""} onChange={(e) => atualizarCampo(estacao.id, "data", e.target.value)} />
                  </td>
                  <td className="p-4 text-center">
                    <input type="time" className="border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none" value={registro.hora || ""} onChange={(e) => atualizarCampo(estacao.id, "hora", e.target.value)} />
                  </td>
                  <td className="p-4 text-center">
                    <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded" checked={registro.abaixo_regua || false} onChange={(e) => atualizarCampo(estacao.id, "abaixo_regua", e.target.checked)} />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={`border rounded-lg p-2 w-28 text-center font-black text-lg transition-all outline-none ${registro.abaixo_regua ? 'bg-slate-100 text-slate-400 border-slate-200' : 'border-slate-300 focus:border-blue-600 text-slate-800'}`}
                      value={registro.nivel || ""}
                      disabled={registro.abaixo_regua}
                      onChange={(e) => atualizarCampo(estacao.id, "nivel", e.target.value)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {mostrarRelatorio && (
        <ModalRelatorio 
          dadosDaTela={dados} 
          estacoes={estacoes.filter(e => idsSelecionados.includes(e.id))} 
          onClose={() => setMostrarRelatorio(false)} 
        />
      )}
    </div>
  )
}
