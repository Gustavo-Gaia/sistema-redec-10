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

  // =========================
  // CRIAR ESTAÇÃO
  // =========================

  async function criarEstacao() {

    if (!nova.rio_id || !nova.municipio)
      return alert("Preencha os campos obrigatórios")

    const { data, error } = await supabase
      .from("estacoes")
      .insert(nova)
      .select()
      .single()

    if (error) {
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

  // =========================
  // SALVAR EDIÇÃO
  // =========================

  async function salvarEdicao() {

    const { error } = await supabase
      .from("estacoes")
      .update(editando)
      .eq("id", editando.id)

    if (error) {
      alert("Erro ao atualizar")
      return
    }

    setLista(
      lista.map((e) =>
        e.id === editando.id ? editando : e
      )
    )

    setEditando(null)

  }

  // =========================
  // ATIVAR / DESATIVAR
  // =========================

  async function toggleEstacao(estacao) {

    const { error } = await supabase
      .from("estacoes")
      .update({ ativo: !estacao.ativo })
      .eq("id", estacao.id)

    if (error) return alert("Erro")

    setLista(
      lista.map((e) =>
        e.id === estacao.id
          ? { ...e, ativo: !e.ativo }
          : e
      )
    )

  }

  // =========================
  // EXCLUIR
  // =========================

  async function excluirEstacao(id) {

    if (!confirm("Excluir estação?")) return

    const { error } = await supabase
      .from("estacoes")
      .delete()
      .eq("id", id)

    if (error) return alert("Erro")

    setLista(lista.filter((e) => e.id !== id))

  }

  // =========================
  // INTERFACE
  // =========================

  return (

    <div className="space-y-6">

      {/* NOVA ESTAÇÃO */}

      <div className="grid md:grid-cols-4 gap-2">

        <select
          className="border p-2 rounded-lg"
          value={nova.rio_id}
          onChange={(e) =>
            setNova({
              ...nova,
              rio_id: e.target.value
            })
          }
        >

          <option value="">Rio</option>

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
            setNova({
              ...nova,
              municipio: e.target.value
            })
          }
        />

        <select
          className="border p-2 rounded-lg"
          value={nova.fonte}
          onChange={(e) =>
            setNova({
              ...nova,
              fonte: e.target.value
            })
          }
        >
          <option>ANA</option>
          <option>INEA</option>
          <option>COMDEC</option>
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
          placeholder="Nível transbordo"
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
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Adicionar
        </button>

      </div>

      {/* TABELA */}

      <div className="overflow-auto">

        <table className="w-full text-sm">

          <thead className="bg-slate-100">

            <tr>
              <th className="p-2 text-left">Município</th>
              <th className="p-2">Fonte</th>
              <th className="p-2">Código</th>
              <th className="p-2">Transbordo</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>

          </thead>

          <tbody>

            {lista.map((e) => (

              <tr key={e.id} className="border-b">

                <td className="p-2">

                  {editando?.id === e.id ? (

                    <input
                      value={editando.municipio}
                      onChange={(ev) =>
                        setEditando({
                          ...editando,
                          municipio: ev.target.value
                        })
                      }
                    />

                  ) : e.municipio}

                </td>

                <td className="p-2 text-center">
                  {e.fonte}
                </td>

                <td className="p-2 text-center">
                  {e.codigo_estacao}
                </td>

                <td className="p-2 text-center">
                  {e.nivel_transbordo}
                </td>

                <td className="p-2 text-center">

                  <button
                    onClick={() => toggleEstacao(e)}
                    className={`px-2 py-1 rounded text-white ${
                      e.ativo
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {e.ativo ? "Ativo" : "Inativo"}
                  </button>

                </td>

                <td className="p-2 flex gap-2 justify-center">

                  {editando?.id === e.id ? (

                    <button
                      onClick={salvarEdicao}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Salvar
                    </button>

                  ) : (

                    <button
                      onClick={() => setEditando(e)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Editar
                    </button>

                  )}

                  <button
                    onClick={() => excluirEstacao(e.id)}
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
