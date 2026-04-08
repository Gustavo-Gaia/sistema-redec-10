/* app/(sistema)/agenda/componentes/ModalEvento.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Trash, Calendar, Clock, Tag } from "lucide-react"

// 🔹 FORMATAÇÃO BLINDADA: Aceita formatos com "T" ou Espaço
function formatarDataInput(dataISO) {
  if (!dataISO) return ""
  const parteData = dataISO.includes("T") ? dataISO.split("T")[0] : dataISO.split(" ")[0]
  return parteData // Retorna YYYY-MM-DD
}

function formatarHoraInput(dataISO) {
  if (!dataISO) return "08:00"
  const parteHora = dataISO.includes("T") ? dataISO.split("T")[1] : dataISO.split(" ")[1]
  if (!parteHora) return "08:00"
  const [hora, minuto] = parteHora.split(":")
  return `${hora}:${minuto}`
}

function gerarHorarios() {
  const horarios = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      horarios.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
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
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
  ]

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    data_inicio: "",
    hora_inicio: "08:00",
    data_fim: "",
    hora_fim: "09:00",
    tipo: "",
    cor: "#3b82f6"
  })

  // Sincroniza o form quando o evento muda (especialmente ao editar)
  useEffect(() => {
    if (evento) {
      setForm({
        titulo: evento.titulo || "",
        descricao: evento.descricao || "",
        data_inicio: formatarDataInput(evento.data_inicio),
        hora_inicio: formatarHoraInput(evento.data_inicio),
        data_fim: formatarDataInput(evento.data_fim || evento.data_inicio),
        hora_fim: formatarHoraInput(evento.data_fim || evento.data_inicio),
        tipo: evento.tipo || "",
        cor: evento.cor || "#3b82f6"
      })
    } else {
      const hoje = new Date().toISOString().split('T')[0]
      setForm(prev => ({ ...prev, data_inicio: hoje, data_fim: hoje }))
    }
    setFimManual(false)
  }, [evento])

  function handleChange(e) {
    const { name, value } = e.target
    if (name === "data_inicio" && !fimManual) {
      setForm(prev => ({ ...prev, data_inicio: value, data_fim: value }))
      return
    }
    if (name === "hora_inicio" && !fimManual) {
      setForm(prev => ({ ...prev, hora_inicio: value, hora_fim: value }))
      return
    }
    if (name === "data_fim" || name === "hora_fim") setFimManual(true)
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSave() {
    if (!form.titulo || !form.data_inicio) {
      alert("Título e data são obrigatórios")
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

    const { error } = isEdit 
      ? await supabase.from("agenda_eventos").update(payload).eq("id", evento.id)
      : await supabase.from("agenda_eventos").insert([payload])

    setLoading(false)
    if (error) {
      alert("Erro ao salvar no banco")
    } else {
      onSaved()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {isEdit ? <Pencil size={20} className="text-blue-600"/> : <Plus size={20} className="text-blue-600"/>}
            {isEdit ? "Editar Atividade" : "Nova Atividade Operacional"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-4">
          {/* TITULO */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Título da Atividade</label>
            <input
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ex: Vistoria Técnica Rio Muriaé"
            />
          </div>

          {/* DATAS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Início</label>
              <div className="flex flex-col gap-2">
                <input type="date" name="data_inicio" value={form.data_inicio} onChange={handleChange}
                  className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                <select name="hora_inicio" value={form.hora_inicio} onChange={handleChange}
                  className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  {horarios.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Fim (Previsto)</label>
              <div className="flex flex-col gap-2">
                <input type="date" name="data_fim" value={form.data_fim} onChange={handleChange}
                  className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                <select name="hora_fim" value={form.hora_fim} onChange={handleChange}
                  className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  {horarios.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Observações</label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Detalhes adicionais..."
            />
          </div>

          {/* CORES */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 text-center block">Etiqueta Visual</label>
            <div className="flex justify-center gap-3 flex-wrap">
              {coresPadrao.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, cor: c })}
                  className={`w-8 h-8 rounded-full border-4 transition-all ${form.cor === c ? "border-gray-300 scale-125 shadow-lg" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-3 rounded-2xl font-semibold text-gray-600 hover:bg-gray-200 transition-all">
            Descartar
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Processando..." : isEdit ? "Atualizar Atividade" : "Confirmar Evento"}
          </button>
        </div>
      </div>
    </div>
  )
}

import { Pencil, Plus } from "lucide-react"
