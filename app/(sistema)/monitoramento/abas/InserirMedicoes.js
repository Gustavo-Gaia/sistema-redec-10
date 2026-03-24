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
  const [idsSelecionados, setIdsSelecionados] = useState([]) // ESTADO PARA SELEÇÃO
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
      .order('id', { ascending: true }) // ALTERADO: Ordenando por ID para manter a sequência geográfica

    setEstacoes(data || [])
    // Por padrão, seleciona todas ao carregar
    setIdsSelecionados(data?.map(e => e.id) || [])
  }

  // Função para alternar seleção individual
  function toggleSelecao(id) {
    setIdsSelecionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Função para selecionar/desmarcar tudo
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
      alert("Erro ao buscar ANA")
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
      alert("Erro ao buscar INEA")
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
      alert("Nenhuma medição para salvar")
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
      alert(`Medições salvas: ${r.inseridos}\nDuplicadas ignoradas: ${r.ignorados}`)
      setDados({})
    } catch {
      alert("Erro ao salvar medições")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Monitoramento em Tempo Real</h3>
          <p className="text-sm text-slate-500">Marque as estações que deseja incluir no relatório visual.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={buscarANA} disabled={loadingAna} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors">
            {loadingAna ? "..." : "Buscar ANA"}
          </button>
          <button onClick={buscarINEA} disabled={loadingInea} className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium transition-colors">
            {loadingInea ? "..." : "Buscar INEA"}
          </button>
          
          <div className="w-px h-10 bg-slate-200 mx-2" />

          <button 
            onClick={() => setMostrarRelatorio(true)} 
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-bold shadow-md transition-all active:scale-95"
          >
            Visualizar Relatório ({idsSelecionados.length})
          </button>

          <button onClick={salvarMedicoes} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors">
            {loading ? "Salvando..." : "Salvar no Banco"}
          </button>
        </div>
      </div>

      {/* TABELA DE INSERÇÃO */}
      <div className="overflow-auto border rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-slate-600 uppercase text-[11px] font-bold">
            <tr>
              {/* Checkbox de Selecionar Todos */}
              <th className="p-3 text-center w-10">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-orange-500 cursor-pointer"
                  checked={idsSelecionados.length === estacoes.length && estacoes.length > 0}
                  onChange={toggleTodos}
                  title="Selecionar todos para o relatório"
                />
              </th>
              <th className="p-3 text-left">Rio / Lagoa</th>
              <th className="p-3 text-left">Município</th>
              <th className="p-3 text-center">Data</th>
              <th className="p-3 text-center">Hora</th>
              <th className="p-3 text-center">A/R</th>
              <th className="p-3 text-center">Nível Atual (m)</th>
            </tr>
          </thead>
          <tbody>
            {estacoes.map((estacao) => {
              const registro = dados[estacao.id] || {}
              const ehComdec = estacao.fonte === "COMDEC"
              const estaSelecionada = idsSelecionados.includes(estacao.id)

              return (
                <tr key={estacao.id} className={`border-b transition-colors ${estaSelecionada ? 'bg-orange-50/30' : ''} ${ehComdec ? 'hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
                  {/* Checkbox Individual */}
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-orange-500 cursor-pointer"
                      checked={estaSelecionada}
                      onChange={() => toggleSelecao(estacao.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      {estacao.rios?.nome}
                      {ehComdec && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded shadow-sm">COMDEC</span>}
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">{estacao.municipio}</td>
                  <td className="p-3 text-center">
                    <input type="date" className="border rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none" value={registro.data || ""} onChange={(e) => atualizarCampo(estacao.id, "data", e.target.value)} />
                  </td>
                  <td className="p-3 text-center">
                    <input type="time" className="border rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none" value={registro.hora || ""} onChange={(e) => atualizarCampo(estacao.id, "hora", e.target.value)} />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={registro.abaixo_regua || false} onChange={(e) => atualizarCampo(estacao.id, "abaixo_regua", e.target.checked)} />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={`border rounded p-1 w-24 text-center font-bold outline-none ${ehComdec ? 'border-blue-400 focus:border-blue-600' : 'focus:border-blue-500'}`}
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

      {/* RENDERIZAÇÃO DO MODAL - FILTRANDO AS ESTAÇÕES */}
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
