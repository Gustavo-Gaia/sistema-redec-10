/* app/(sistema)/agenda/componentes/ModalEvento.js */

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { X, Trash } from "lucide-react"

export default function ModalEvento({ evento, onClose, onSaved }) {

  const isEdit = !!evento

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    titulo: evento?.titulo || "",
    descricao: evento?.descricao || "",
    data_inicio: evento?.data_inicio
      ? new Date(evento.data_inicio).toISOString().slice(0, 16)
      : "",
    data_fim: evento?.data_fim
      ? new Date(evento.data_fim).toISOString().slice(0, 16)
      : "",
    tipo: evento?.tipo || "",
    cor: evento?.cor || "#3b82f6"
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // 🔥 SALVAR (CRIAR OU EDITAR)
  async function handleSave() {
    if (!form.titulo || !form.data_inicio) {
      alert("Preencha título e data")
      return
    }

    setLoading(true)

    const { data: user } = await supabase.auth.getUser()

    const payload = {
      ...form,
      criado_por: user?.user?.id
    }

    let error

    if (isEdit) {
      const res = await supabase
        .from("agenda_eventos")
        .update(payload)
        .eq("id", evento.id)

      error = res.error
    } else {
      const res = await supabase
        .from("agenda_eventos")
        .insert([payload])

      error = res.error
    }

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Erro ao salvar")
      return
    }

    onSaved()
    onClose()
  }

  // 🔥 EXCLUIR
  async function handleDelete() {
    if (!confirm("Deseja excluir este evento?")) return

    setLoading(true)

    const { error } = await supabase
      .from("agenda_eventos")
      .delete()
      .eq("id", evento.id)

    setLoading(false)

    if (error) {
      alert("Erro ao excluir")
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {isEdit ? "Editar Evento" : "Novo Evento"}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-3">

          <input
            name="titulo"
            placeholder="Título"
            value={form.titulo}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <textarea
            name="descricao"
            placeholder="Descrição"
            value={form.descricao}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="datetime-local"
              name="data_inicio"
              value={form.data_inicio}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="datetime-local"
              name="data_fim"
              value={form.data_fim}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <input
            name="tipo"
            placeholder="Tipo (ex: reunião)"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <div className="flex items-center gap-2">
            <span className="text-sm">Cor:</span>
            <input
              type="color"
              name="cor"
              value={form.cor}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* AÇÕES */}
        <div className="flex justify-between items-center pt-4">

          {isEdit && (
            <button
              onClick={handleDelete}
              className="text-red-600 flex items-center gap-1"
            >
              <Trash size={16} />
              Excluir
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
