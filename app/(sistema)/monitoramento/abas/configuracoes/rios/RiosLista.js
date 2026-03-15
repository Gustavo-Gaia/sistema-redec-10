/* app/(sistema)/monitoramento/abas/configuracoes/rios/RiosLista.js */

"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function RiosLista({ rios }) {

  const router = useRouter()

  const [lista, setLista] = useState(rios)

  const [novoRio, setNovoRio] = useState({
    nome: "",
    tipo: "rio"
  })

  const [editando, setEditando] = useState(null)

  // =========================
  // CRIAR RIO
  // =========================

  async function criarRio() {

    if (!novoRio.nome) {
      alert("Digite o nome do rio")
      return
    }

    const { data, error } = await supabase
      .from("rios")
      .insert({
        nome: novoRio.nome,
        tipo: novoRio.tipo
      })
      .select()
      .single()

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

    router.refresh()

  }

  // =========================
  // SALVAR EDIÇÃO
  // =========================

  async function salvarEdicao() {

    const { error } = await supabase
      .from("rios")
      .update({
        nome: editando.nome,
        tipo: editando.tipo
      })
      .eq("id", editando.id)

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

    router.refresh()

  }

  // =========================
  // ATIVAR / DESATIVAR
  // =========================

  async function toggleRio(rio) {

    const { error } = await supabase
      .from("rios")
      .update({
        ativo: !rio.ativo
      })
      .eq("id", rio.id)

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

    router.refresh()

  }

  // =========================
  // EXCLUIR
  // =========================

  async function excluirRio(id) {

    if (!confirm("Excluir este rio?")) return

    const { error } = await supabase
      .from("rios")
      .delete()
      .eq("id", id)

    if (error) {
      console.log(error)
      alert("Erro ao excluir")
      return
    }

    setLista(lista.filter((r) => r.id !== id))

    router.refresh()

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
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Salvar
                    </button>

                  ) : (

                    <button
                      onClick={() => setEditando(rio)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Editar
                    </button>

                  )}

                  <button
                    onClick={() => excluirRio(rio.id)}
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

