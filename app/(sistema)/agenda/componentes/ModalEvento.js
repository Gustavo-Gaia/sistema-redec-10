/* app/(sistema)/agenda/componentes/ModalEvento.js */

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { X, Trash } from "lucide-react"

export default function ModalEvento({ evento, onClose, onSaved }) {

  const isEdit = !!evento
  const [loading, setLoading] = useState(false)

  // 🎨 CORES PADRÃO
  const coresPadrao = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316"
  ]

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

  // 🔥 SALVAR (SEM criado_por)
  async function handleSave() {
    if (!form.titulo || !form.data_inicio) {
      alert("Preencha título e data")
      return
    }

    setLoading(true)

    let error

    if (isEdit) {
      const { error: err } = await supabase
        .from("agenda_eventos")
        .update(form)
        .eq("id", evento.id)

      error = err
    } else {
      const { error: err } = await supabase
        .from("agenda_eventos")
        .insert([form])

      error = err
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {isEdit ? "Editar Evento" : "Novo Evento"}
          </h2>

          <button onClick={onClose} className="hover:opacity-70">
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
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="descricao"
            placeholder="Descrição"
            value={form.descricao}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="datetime-local"
              name="data_inicio"
              value={form.data_inicio}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="datetime-local"
              name="data_fim"
              value={form.data_fim}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            name="tipo"
            placeholder="Tipo (ex: reunião)"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* 🎨 CORES */}
          <div>
            <p className="text-sm mb-1">Cor</p>

            <div className="flex gap-2 flex-wrap">
              {coresPadrao.map((c) => (
                <div
                  key={c}
                  onClick={() => setForm({ ...form, cor: c })}
                  className={`w-7 h-7 rounded-full cursor-pointer border-2 transition ${
                    form.cor === c
                      ? "border-black scale-110"
                      : "border-white"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

        </div>

        {/* AÇÕES */}
        <div className="flex justify-between items-center pt-4">

          {isEdit && (
            <button
              onClick={handleDelete}
              className="text-red-600 flex items-center gap-1 hover:opacity-80"
            >
              <Trash size={16} />
              Excluir
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
