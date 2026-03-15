/* app/(sistema)/monitoramento/abas/configuracoes/rios/RiosLista.js */

"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function RiosLista({ rios }) {

  const [lista, setLista] = useState(rios)

  const [loading, setLoading] = useState(false)

  const [novoRio, setNovoRio] = useState({
    nome: "",
    tipo: "rio"
  })

  const [editando, setEditando] = useState(null)

  // =========================
  // CRIAR RIO
  // =========================

  async function criarRio() {

    if (loading) return

    if (!novoRio.nome) {
      alert("Digite o nome do rio")
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from("rios")
      .insert({
        nome: novoRio.nome,
        tipo: novoRio.tipo
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.log(error)
      alert("Erro ao criar rio")
      return
    }

    setLista([...lista, data])

    setNovoRio({
      nome: "",
      tipo: "rio"
    })

  }

  // =========================
  // SALVAR EDIÇÃO
  // =========================

  async function salvarEdicao() {

    if (loading) return

    setLoading(true)

    const { error } = await supabase
      .from("rios")
      .update({
        nome: editando.nome,
        tipo: editando.tipo
      })
      .eq("id", editando.id)

    setLoading(false)

    if (error) {
      console.log(error)
      alert("Erro ao atualizar")
      return
    }

    setLista(
      lista.map((r) =>
        r.id === editando.id ? editando : r
      )
    )

    setEditando(null)

  }

  // =========================
  // ATIVAR / DESATIVAR
  // =========================

  async function toggleRio(rio) {

    if (loading) return

    setLoading(true)

    const { error } = await supabase
      .from("rios")
      .update({
        ativo: !rio.ativo
      })
      .eq("id", rio.id)

    setLoading(false)

    if (error) {
      console.log(error)
      alert("Erro ao alterar status")
      return
    }

    setLista(
      lista.map((r) =>
        r.id === rio.id
          ? { ...r, ativo: !r.ativo }
          : r
      )
    )

  }

  // =========================
  // EXCLUIR
  // =========================

  async function excluirRio(id) {

    if (loading) return

    if (!confirm("Excluir este rio?")) return

    setLoading(true)

    const { error } = await supabase
      .from("rios")
      .delete()
      .eq("id", id)

    setLoading(false)

    if (error) {

      console.log(error)

      // erro de foreign key
      if (error.code === "23503") {
        alert("Este rio possui estações cadastradas e não pode ser excluído.")
      } else {
        alert("Erro ao excluir rio")
      }

      return
    }

    setLista(lista.filter((r) => r.id !== id))

  }

  // =========================
  // INTERFACE
  // =========================

  return (

    <div className="space-y-6">

      {/* NOVO RIO */}

      <div className="flex flex-col md:flex-row gap-2">

        <input
          placeholder="Nome do rio"
          className="border p-2 rounded-lg"
          value={novoRio.nome}
          onChange={(e) =>
            setNovoRio({
              ...novoRio,
              nome: e.target.value
            })
          }
        />

        <select
          className="border p-2 rounded-lg"
          value={novoRio.tipo}
          onChange={(e) =>
            setNovoRio({
              ...novoRio,
              tipo: e.target.value
            })
          }
        >
          <option value="rio">Rio</option>
          <option value="canal">Canal</option>
          <option value="lagoa">Lagoa</option>
        </select>

        <button
          onClick={criarRio}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Adicionar"}
        </button>

      </div>

      {/* TABELA */}

      <div className="overflow-auto">

        <table className="w-full text-sm">

          <thead className="bg-slate-100">

            <tr>
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-center">Tipo</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Ações</th>
            </tr>

          </thead>

          <tbody>

            {lista.map((rio) => (

              <tr key={rio.id} className="border-b">

                <td className="p-2">

                  {editando?.id === rio.id ? (

                    <input
                      className="border p-1 rounded"
                      value={editando.nome}
                      onChange={(e) =>
                        setEditando({
                          ...editando,
                          nome: e.target.value
                        })
                      }
                    />

                  ) : rio.nome}

                </td>

                <td className="p-2 text-center">

                  {editando?.id === rio.id ? (

                    <select
                      className="border p-1 rounded"
                      value={editando.tipo}
                      onChange={(e) =>
                        setEditando({
                          ...editando,
                          tipo: e.target.value
                        })
                      }
                    >
                      <option value="rio">Rio</option>
                      <option value="canal">Canal</option>
                      <option value="lagoa">Lagoa</option>
                    </select>

                  ) : rio.tipo}

                </td>

                <td className="p-2 text-center">

                  <button
                    onClick={() => toggleRio(rio)}
                    disabled={loading}
                    className={`px-2 py-1 rounded text-white ${
                      rio.ativo ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {rio.ativo ? "Ativo" : "Inativo"}
                  </button>

                </td>

                <td className="p-2 flex gap-2 justify-center">

                  {editando?.id === rio.id ? (

                    <button
                      onClick={salvarEdicao}
                      disabled={loading}
                      className="bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
                    >
                      {loading ? "Salvando..." : "Salvar"}
                    </button>

                  ) : (

                    <button
                      onClick={() => setEditando(rio)}
                      disabled={loading}
                      className="bg-yellow-500 text-white px-2 py-1 rounded disabled:opacity-50"
                    >
                      Editar
                    </button>

                  )}

                  <button
                    onClick={() => excluirRio(rio.id)}
                    disabled={loading}
                    className="bg-red-600 text-white px-2 py-1 rounded disabled:opacity-50"
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
