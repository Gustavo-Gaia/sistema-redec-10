/* app/(sistema)/monitoramento/abas/configuracoes/estacoes/EstacoesLista.js */

"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EstacoesLista({ rios, estacoes }) {

  const router = useRouter()

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

    if (!nova.rio_id || !nova.municipio) {
      alert("Preencha rio e município")
      return
    }

    const { data, error } = await supabase
      .from("estacoes")
      .insert({
        rio_id: Number(nova.rio_id),
        municipio: nova.municipio,
        fonte: nova.fonte,
        codigo_estacao: nova.codigo_estacao,
        nivel_transbordo: nova.nivel_transbordo || null,
        latitude: nova.latitude || null,
        longitude: nova.longitude || null
      })
      .select()
      .single()

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

    router.refresh()

  }

  // =========================
  // SALVAR EDIÇÃO
  // =========================

  async function salvarEdicao() {

    const { error } = await supabase
      .from("estacoes")
      .update({
        municipio: editando.municipio,
        nivel_transbordo: editando.nivel_transbordo
      })
      .eq("id", editando.id)

    if (error) {
      console.log(error)
      alert("Erro ao atualizar")
      return
    }

    setLista(
      lista.map((e) =>
        e.id === editando.id ? editando : e
      )
    )

    setEditando(null)

    router.refresh()

  }

  // =========================
  // ATIVAR / DESATIVAR
  // =========================

  async function toggleEstacao(estacao) {

    const { error } = await supabase
      .from("estacoes")
      .update({
        ativo: !estacao.ativo
      })
      .eq("id", estacao.id)

    if (error) {
      console.log(error)
      alert("Erro")
      return
    }

    setLista(
      lista.map((e) =>
        e.id === estacao.id
          ? { ...e, ativo: !e.ativo }
          : e
      )
    )

    router.refresh()

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

    if (error) {
      console.log(error)
      alert("Erro")
      return
    }

    setLista(lista.filter((e) => e.id !== id))

    router.refresh()

  }

  return (

    <div className="space-y-6">

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

    </div>

  )

}
