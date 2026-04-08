/* app/(sistema)/agenda/componentes/ModalEvento.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Trash } from "lucide-react"

// 🔹 FORMATA DATA PARA INPUT DE DATA
function formatarDataInput(data) {
  if (!data) return ""
  const [date, time] = data.split(" ")
  const [ano, mes, dia] = date.split("-")
  const [hora, minuto] = time.split(":")
  return `${ano}-${mes}-${dia}`
}

// 🔹 FORMATA HORA PARA INPUT DE HORA
function formatarHoraInput(data) {
  if (!data) return "00:00"
  const [_, time] = data.split(" ")
  const [hora, minuto] = time.split(":")
  return `${hora}:${minuto}`
}

// 🔹 GERA HORÁRIOS DE 5 EM 5 MINUTOS
function gerarHorarios() {
  const horarios = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const hora = String(h).padStart(2, "0")
      const minuto = String(m).padStart(2, "0")
      horarios.push(`${hora}:${minuto}`)
    }
  }
  return horarios
}

export default function ModalEvento({ evento, onClose, onSaved }) {
  const isEdit = !!evento
  const [loading, setLoading] = useState(false)
  const [fimManual, setFimManual] = useState(false)
  const horarios = gerarHorarios()

  const coresPadrao = [
    "#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316"
  ]

  const [form, setForm] = useState({
    titulo: evento?.titulo || "",
    descricao: evento?.descricao || "",
    data_inicio: formatarDataInput(evento?.data_inicio),
    hora_inicio: formatarHoraInput(evento?.data_inicio),
    data_fim: formatarDataInput(evento?.data_fim) || formatarDataInput(evento?.data_inicio),
    hora_fim: formatarHoraInput(evento?.data_fim) || formatarHoraInput(evento?.data_inicio),
    tipo: evento?.tipo || "",
    cor: evento?.cor || "#3b82f6"
  })

  // 🔹 HANDLE CHANGE
  function handleChange(e) {
    const { name, value } = e.target

    if (name === "data_inicio") {
      if (!fimManual) {
        setForm({
          ...form,
          data_inicio: value,
          data_fim: value
        })
      } else {
        setForm({ ...form, data_inicio: value })
      }
      return
    }

    if (name === "hora_inicio") {
      if (!fimManual) {
        setForm({
          ...form,
          hora_inicio: value,
          hora_fim: value
        })
      } else {
        setForm({ ...form, hora_inicio: value })
      }
      return
    }

    if (name === "data_fim" || name === "hora_fim") {
      setFimManual(true)
    }

    setForm({ ...form, [name]: value })
  }

  // 🔹 RESET fimManual ao abrir
  useEffect(() => setFimManual(false), [evento])

  // 🔹 SALVAR
  async function handleSave() {
    if (!form.titulo || !form.data_inicio || !form.hora_inicio) {
      alert("Preencha título, data e hora")
      return
    }

    setLoading(true)

    const payload = {
      titulo: form.titulo,
      descricao: form.descricao,
      tipo: form.tipo,
      cor: form.cor,
      data_inicio: `${form.data_inicio} ${form.hora_inicio}:00`,
      data_fim: `${form.data_fim} ${form.hora_fim}:00`
    }

    let error
    if (isEdit) {
      const { error: err } = await supabase
        .from("agenda_eventos")
        .update(payload)
        .eq("id", evento.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from("agenda_eventos")
        .insert([payload])
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

  // 🔹 EXCLUIR
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
          <button onClick={onClose} className="hover:opacity-70"><X /></button>
        </div>

        {/* FORM */}
        <div className="space-y-3">
          <input
            name="titulo"
            placeholder="Título"
            value={form.titulo}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="descricao"
            placeholder="Descrição"
            value={form.descricao}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* DATAS E HORAS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Início</label>
              <input
                type="date"
                name="data_inicio"
                value={form.data_inicio}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 mb-1"
              />
              <select
                name="hora_inicio"
                value={form.hora_inicio}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {horarios.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Fim</label>
              <input
                type="date"
                name="data_fim"
                value={form.data_fim}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 mb-1"
              />
              <select
                name="hora_fim"
                value={form.hora_fim}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {horarios.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <input
            name="tipo"
            placeholder="Tipo (ex: reunião)"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* CORES */}
          <div>
            <p className="text-sm mb-1">Cor</p>
            <div className="flex gap-2 flex-wrap">
              {coresPadrao.map(c => (
                <div
                  key={c}
                  onClick={() => setForm({ ...form, cor: c })}
                  className={`w-7 h-7 rounded-full cursor-pointer border-2 transition ${form.cor === c ? "border-black scale-110" : "border-white"}`}
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
              <Trash size={16} /> Excluir
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-100">Cancelar</button>
            <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">{loading ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
