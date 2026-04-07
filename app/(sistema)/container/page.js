/* app/(sistema)/container/page.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import CardResumo from "./componentes/CardResumo"
import TimelineMovimentacoes from "./componentes/TimelineMovimentacoes"
import ModalMovimentacao from "./componentes/ModalMovimentacao"

import { Plus } from "lucide-react"

export default function ContainerPage() {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [saldo, setSaldo] = useState({ colchoes: 0, kits: 0 })

  const [modalOpen, setModalOpen] = useState(false)
  const [movimentacaoEditando, setMovimentacaoEditando] = useState(null)

  const [toast, setToast] = useState(null)

  // 🔥 TOAST
  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function buscarMovimentacoes() {
    const { data } = await supabase
      .from("movimentacoes_humanitarias")
      .select("*")
      .order("data_hora", { ascending: false })

    setMovimentacoes(data || [])
  }

  async function buscarSaldo() {
    const { data } = await supabase
      .from("saldo_humanitario")
      .select("*")
      .single()

    if (data) setSaldo(data)
  }

  async function uploadArquivo(file) {
    if (!file) return null

    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from("guias-humanitarias")
      .upload(fileName, file)

    if (error) {
      console.error(error)
      showToast("Erro ao enviar arquivo", "error")
      return null
    }

    const { data } = await supabase.storage
      .from("guias-humanitarias")
      .createSignedUrl(fileName, 60 * 60 * 24 * 7)

    return data.signedUrl
  }

  // 🔥 CREATE + UPDATE
  async function salvarMovimentacao(form, file, id = null) {
    const { data: user } = await supabase.auth.getUser()

    let arquivo_url = form.arquivo_url || null

    if (file) {
      arquivo_url = await uploadArquivo(file)
    }

    try {
      if (id) {
        // UPDATE
        await supabase
          .from("movimentacoes_humanitarias")
          .update({
            ...form,
            arquivo_url
          })
          .eq("id", id)

        showToast("Movimentação atualizada com sucesso")
      } else {
        // INSERT
        await supabase.from("movimentacoes_humanitarias").insert([
          {
            ...form,
            arquivo_url,
            usuario_id: user.user.id
          }
        ])

        showToast("Movimentação registrada com sucesso")
      }

      await buscarMovimentacoes()
      await buscarSaldo()

      setModalOpen(false)
      setMovimentacaoEditando(null)

    } catch (err) {
      console.error(err)
      showToast("Erro ao salvar", "error")
    }
  }

  // 🔥 DELETE
  async function deletarMovimentacao(id) {
    const confirmar = confirm("Deseja realmente excluir?")

    if (!confirmar) return

    await supabase
      .from("movimentacoes_humanitarias")
      .delete()
      .eq("id", id)

    showToast("Movimentação excluída")

    await buscarMovimentacoes()
    await buscarSaldo()
  }

  // 🔥 EDITAR
  function editarMovimentacao(mov) {
    setMovimentacaoEditando(mov)
    setModalOpen(true)
  }

  useEffect(() => {
    buscarMovimentacoes()
    buscarSaldo()
  }, [])

  return (
    <div className="p-6 space-y-6">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white z-50 shadow-lg ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">Contêiner Humanitário C-02</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardResumo titulo="Colchões" quantidade={saldo.colchoes} capacidade={102} />
        <CardResumo titulo="Kits" quantidade={saldo.kits} capacidade={102} />
      </div>

      <TimelineMovimentacoes
        movimentacoes={movimentacoes}
        onDelete={deletarMovimentacao}
        onEdit={editarMovimentacao}
      />

      <button
        onClick={() => {
          setMovimentacaoEditando(null)
          setModalOpen(true)
        }}
        className="fixed bottom-20 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition z-50"
      >
        <Plus />
      </button>

      {modalOpen && (
        <ModalMovimentacao
          onClose={() => {
            setModalOpen(false)
            setMovimentacaoEditando(null)
          }}
          onSave={salvarMovimentacao}
          movimentacao={movimentacaoEditando}
        />
      )}
    </div>
  )
}
