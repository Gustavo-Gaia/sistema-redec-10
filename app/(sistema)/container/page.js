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
      return null
    }

    const { data } = await supabase.storage
      .from("guias-humanitarias")
      .createSignedUrl(fileName, 60 * 60 * 24 * 7)

    return data.signedUrl
  }

  async function inserirMovimentacao(form, file) {
    const { data: user } = await supabase.auth.getUser()

    let arquivo_url = null

    if (file) {
      arquivo_url = await uploadArquivo(file)
    }

    await supabase.from("movimentacoes_humanitarias").insert([
      {
        ...form,
        arquivo_url,
        usuario_id: user.user.id
      }
    ])

    await buscarMovimentacoes()
    await buscarSaldo()
    setModalOpen(false)
  }

  useEffect(() => {
    buscarMovimentacoes()
    buscarSaldo()
  }, [])

  return (
    <div className="p-6 space-y-6">

      <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">Contêiner Humanitário</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardResumo titulo="Colchões" quantidade={saldo.colchoes} capacidade={102} />
        <CardResumo titulo="Kits" quantidade={saldo.kits} capacidade={102} />
      </div>

      <TimelineMovimentacoes movimentacoes={movimentacoes} />

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-20 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition z-50"
      >
        <Plus />
      </button>

      {modalOpen && (
        <ModalMovimentacao
          onClose={() => setModalOpen(false)}
          onSave={inserirMovimentacao}
        />
      )}
    </div>
  )
}
