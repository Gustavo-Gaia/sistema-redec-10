/* app/(sistema)/monitoramento/abas/InserirMedicoes. */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function InserirMedicoes() {

  const [estacoes, setEstacoes] = useState([])
  const [dados, setDados] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingAna, setLoadingAna] = useState(false)
  const [loadingInea, setLoadingInea] = useState(false)

  // ===============================
  // CARREGAR ESTAÇÕES
  // ===============================

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
        rios(nome)
      `)
      .eq("ativo", true)

    setEstacoes(data || [])
  }

  // ===============================
  // ATUALIZAR CAMPOS
  // ===============================

  function atualizarCampo(id, campo, valor) {

    setDados((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor
      }
    }))
  }

  // ===============================
  // BUSCAR ANA
  // ===============================

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

  // ===============================
  // BUSCAR INEA
  // ===============================

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

  // ===============================
  // SALVAR MEDIÇÕES
  // ===============================

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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registros)
      })

      const r = await resp.json()

      alert(
        `Medições salvas: ${r.inseridos}\nDuplicadas ignoradas: ${r.ignorados}`
      )

      setDados({})

    } catch {

      alert("Erro ao salvar medições")

    }

    setLoading(false)

  }

  // ===============================
  // INTERFACE
  // ===============================

  return (

    <div className="space-y-6">

      {/* CABEÇALHO */}

      <div className="flex items-center justify-between">

        <h3 className="text-xl font-semibold text-slate-800">
          Inserir Medições
        </h3>

        <div className="flex gap-2">

          <button
            onClick={buscarANA}
            disabled={loadingAna}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
          >
            {loadingAna ? "Buscando..." : "Buscar ANA"}
          </button>

          <button
            onClick={buscarINEA}
            disabled={loadingInea}
            className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700"
          >
            {loadingInea ? "Buscando..." : "Buscar INEA"}
          </button>

          <button
            onClick={salvarMedicoes}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>

        </div>

      </div>

      {/* TABELA */}

      <div className="overflow-auto border rounded-lg">

        <table className="w-full text-sm">

          <thead className="bg-slate-100 border-b">

            <tr>
              <th className="p-2 text-left">Rio</th>
              <th className="p-2 text-left">Município</th>
              <th className="p-2 text-center">Data</th>
              <th className="p-2 text-center">Hora</th>
              <th className="p-2 text-center">A/R</th>
              <th className="p-2 text-center">Nível (m)</th>
            </tr>

          </thead>

          <tbody>

            {estacoes.map((estacao) => {

              const registro = dados[estacao.id] || {}
              
              // 🔥 LOGICA DE REALCE COMDEC
              const ehComdec = estacao.fonte === "COMDEC"

              return (

                <tr 
                  key={estacao.id} 
                  className={`border-b transition-colors ${ehComdec ? 'bg-blue-50/70 hover:bg-blue-100' : 'hover:bg-slate-50'}`}
                >

                  <td className="p-2 font-medium">
                    <div className="flex items-center gap-2">
                      {estacao.rios?.nome}
                      {ehComdec && (
                        <span className="text-[10px] bg-blue-600 text-white px-1 py-0.5 rounded font-bold">
                          COMDEC
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-2">{estacao.municipio}</td>

                  <td className="p-2 text-center">
                    <input
                      type="date"
                      className={`border rounded p-1 ${ehComdec ? 'border-blue-400' : ''}`}
                      value={registro.data || ""}
                      onChange={(e) =>
                        atualizarCampo(estacao.id, "data", e.target.value)
                      }
                    />
                  </td>

                  <td className="p-2 text-center">
                    <input
                      type="time"
                      className={`border rounded p-1 ${ehComdec ? 'border-blue-400' : ''}`}
                      value={registro.hora || ""}
                      onChange={(e) =>
                        atualizarCampo(estacao.id, "hora", e.target.value)
                      }
                    />
                  </td>

                  <td className="p-2 text-center">

                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer"
                      checked={registro.abaixo_regua || false}
                      onChange={(e) =>
                        atualizarCampo(
                          estacao.id,
                          "abaixo_regua",
                          e.target.checked
                        )
                      }
                    />

                  </td>

                  <td className="p-2 text-center">

                    <input
                      type="number"
                      step="0.01"
                      className={`border rounded p-1 w-24 text-center font-bold ${ehComdec ? 'border-blue-500 ring-1 ring-blue-200' : ''}`}
                      value={registro.nivel || ""}
                      disabled={registro.abaixo_regua}
                      onChange={(e) =>
                        atualizarCampo(estacao.id, "nivel", e.target.value)
                      }
                    />

                  </td>

                </tr>

              )
            })}

          </tbody>

        </table>

      </div>

    </div>

  )

}
