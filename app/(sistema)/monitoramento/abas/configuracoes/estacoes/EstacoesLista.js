/* app/(sistema)/monitoramento/abas/configuracoes/estacoes/EstacoesLista.js */

"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EstacoesLista({ rios, estacoes }) {

  const [lista, setLista] = useState(estacoes)

  const [loading, setLoading] = useState(false)

  const [nova, setNova] = useState({
    rio_id: "",
    municipio: "",
    fonte: "ANA",
    codigo_estacao: "",
    nivel_transbordo: "",
    latitude: "",
    longitude: ""
  })

  const [editando, setEditando] = useState(null)

  // mapa de rios
  const riosMap = {}
  rios.forEach((r) => {
    riosMap[r.id] = r.nome
  })

  // =============================
  // CRIAR ESTAÇÃO
  // =============================

  async function criarEstacao() {

    if (loading) return

    if (!nova.rio_id || !nova.municipio) {
      alert("Selecione o rio e informe o município")
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from("estacoes")
      .insert({
        rio_id: Number(nova.rio_id),
        municipio: nova.municipio,
        fonte: nova.fonte,
        codigo_estacao: nova.codigo_estacao,
        nivel_transbordo: nova.nivel_transbordo
          ? Number(nova.nivel_transbordo)
          : null,
        latitude: nova.latitude
          ? Number(nova.latitude)
          : null,
        longitude: nova.longitude
          ? Number(nova.longitude)
          : null
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.log(error)
      alert("Erro ao criar estação")
      return
    }

    setLista([...lista, data])

    setNova({
      rio_id: "",
      municipio: "",
      fonte: "ANA",
      codigo_estacao: "",
      nivel_transbordo: "",
      latitude: "",
      longitude: ""
    })

  }

  // =============================
  // SALVAR EDIÇÃO
  // =============================

  async function salvarEdicao() {

    if (loading) return

    setLoading(true)

    const { error } = await supabase
      .from("estacoes")
      .update({
        municipio: editando.municipio,
        fonte: editando.fonte,
        codigo_estacao: editando.codigo_estacao,
        nivel_transbordo: editando.nivel_transbordo
          ? Number(editando.nivel_transbordo)
          : null,
        latitude: editando.latitude
          ? Number(editando.latitude)
          : null,
        longitude: editando.longitude
          ? Number(editando.longitude)
          : null
      })
      .eq("id", editando.id)

    setLoading(false)

    if (error) {
      console.log(error)
      alert("Erro ao atualizar estação")
      return
    }

    setLista(
      lista.map((e) =>
        e.id === editando.id ? editando : e
      )
    )

    setEditando(null)

  }

  // =============================
  // ATIVAR / DESATIVAR
  // =============================

  async function toggleEstacao(estacao) {

    if (loading) return

    setLoading(true)

    const { error } = await supabase
      .from("estacoes")
      .update({
        ativo: !estacao.ativo
      })
      .eq("id", estacao.id)

    setLoading(false)

    if (error) {
      console.log(error)
      alert("Erro ao alterar status")
      return
    }

    setLista(
      lista.map((e) =>
        e.id === estacao.id
          ? { ...e, ativo: !e.ativo }
          : e
      )
    )

  }

  // =============================
  // EXCLUIR
  // =============================

  async function excluirEstacao(id) {

    if (loading) return

    if (!confirm("Excluir estação?")) return

    setLoading(true)

    const { error } = await supabase
      .from("estacoes")
      .delete()
      .eq("id", id)

    setLoading(false)

    if (error) {
      console.log(error)
      alert("Erro ao excluir estação")
      return
    }

    setLista(lista.filter((e) => e.id !== id))

  }

  // =============================
  // INTERFACE
  // =============================

  return (

    <div className="space-y-6">

      {/* CRIAR ESTAÇÃO */}

      <div className="grid md:grid-cols-4 gap-2">

        <select
          className="border p-2 rounded-lg"
          value={nova.rio_id}
          onChange={(e) =>
            setNova({ ...nova, rio_id: e.target.value })
          }
        >
          <option value="">Selecionar rio</option>

          {rios.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
            </option>
          ))}

        </select>

        <input
          placeholder="Município"
          className="border p-2 rounded-lg"
          value={nova.municipio}
          onChange={(e) =>
            setNova({ ...nova, municipio: e.target.value })
          }
        />

        <select
          className="border p-2 rounded-lg"
          value={nova.fonte}
          onChange={(e) =>
            setNova({ ...nova, fonte: e.target.value })
          }
        >
          <option value="ANA">ANA</option>
          <option value="INEA">INEA</option>
          <option value="COMDEC">COMDEC</option>
        </select>

        <input
          placeholder="Código estação"
          className="border p-2 rounded-lg"
          value={nova.codigo_estacao}
          onChange={(e) =>
            setNova({
              ...nova,
              codigo_estacao: e.target.value
            })
          }
        />

        <input
          placeholder="Nível de transbordo"
          type="number"
          step="0.01"
          className="border p-2 rounded-lg"
          value={nova.nivel_transbordo}
          onChange={(e) =>
            setNova({
              ...nova,
              nivel_transbordo: e.target.value
            })
          }
        />

        <input
          placeholder="Latitude"
          type="number"
          step="0.000001"
          className="border p-2 rounded-lg"
          value={nova.latitude}
          onChange={(e) =>
            setNova({
              ...nova,
              latitude: e.target.value
            })
          }
        />

        <input
          placeholder="Longitude"
          type="number"
          step="0.000001"
          className="border p-2 rounded-lg"
          value={nova.longitude}
          onChange={(e) =>
            setNova({
              ...nova,
              longitude: e.target.value
            })
          }
        />

        <button
          onClick={criarEstacao}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Adicionar Estação"}
        </button>

      </div>

      {/* TABELA */}

      <div className="overflow-auto">

        <table className="w-full text-sm">

          <thead className="bg-slate-100">

            <tr>
              <th className="p-2">Município</th>
              <th className="p-2">Rio</th>
              <th className="p-2">Fonte</th>
              <th className="p-2">Código</th>
              <th className="p-2">Transbordo</th>
              <th className="p-2">Latitude</th>
              <th className="p-2">Longitude</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>

          </thead>

          <tbody>

            {lista.map((e) => (

              <tr key={e.id} className="border-b">

                <td className="p-2">{e.municipio}</td>

                <td className="text-center">
                  {riosMap[e.rio_id] || "-"}
                </td>

                <td className="text-center">{e.fonte}</td>
                <td className="text-center">{e.codigo_estacao}</td>
                <td className="text-center">{e.nivel_transbordo}</td>
                <td className="text-center">{e.latitude}</td>
                <td className="text-center">{e.longitude}</td>

                <td className="text-center">

                  <button
                    onClick={() => toggleEstacao(e)}
                    disabled={loading}
                    className={`px-2 py-1 rounded text-white ${
                      e.ativo ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {e.ativo ? "Ativo" : "Inativo"}
                  </button>

                </td>

                <td className="flex gap-2 justify-center">

                  <button
                    onClick={() => setEditando(e)}
                    disabled={loading}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => excluirEstacao(e.id)}
                    disabled={loading}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Excluir
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}
