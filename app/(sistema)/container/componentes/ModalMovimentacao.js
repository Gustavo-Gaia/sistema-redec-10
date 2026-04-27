/* app/(sistema)/container/componentes/ModalMovimentacao.js */

"use client"

import { useEffect, useState } from "react"
import { X, FileText, Truck, Users, Hash, MapPin, ClipboardList, Package, CalendarClock } from "lucide-react"

export default function ModalMovimentacao({
  onClose,
  onSave,
  movimentacao
}) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    tipo: "ENTRADA",
    data_hora: new Date().toISOString().slice(0, 16),
    viatura: "",
    guarnicao: "",
    lacre: "",
    origem_destino: "",
    guia: "",
    colchao_qtd: 0,
    kit_dorm_qtd: 0,
    observacao: ""
  })

  // 🔥 CORREÇÃO DEFINITIVA
  useEffect(() => {
    if (movimentacao) {
      setForm({
        ...movimentacao,
        data_hora: movimentacao.data_hora?.slice(0, 16)
      })

      // ❌ NÃO tenta carregar PDF antigo
      // ✅ evita erro de token expirado
      setPreviewUrl(null)
      setFile(null)
    }
  }, [movimentacao])

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  function handleFileChange(e) {
    const selected = e.target.files[0]
    setFile(selected)

    if (selected) {
      const url = URL.createObjectURL(selected)
      setPreviewUrl(url)
    }
  }

  async function handleSubmit() {
    if (loading) return

    setLoading(true)

    await onSave(
      {
        ...form,
        colchao_qtd: Number(form.colchao_qtd),
        kit_dorm_qtd: Number(form.kit_dorm_qtd)
      },
      file,
      movimentacao?.id
    )

    setLoading(false)
  }

  const inputStyle = "w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
  const labelStyle = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* HEADER */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${form.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
              <Package size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {movimentacao ? "Editar Registro" : "Nova Movimentação"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className={labelStyle}>Tipo de Operação</label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className={`${inputStyle} font-bold ${form.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-orange-600'}`}
              >
                <option value="ENTRADA">🟢 ENTRADA</option>
                <option value="SAÍDA">🟠 SAÍDA</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>Data e Hora</label>
              <div className="relative">
                <CalendarClock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="datetime-local"
                  name="data_hora"
                  value={form.data_hora}
                  onChange={handleChange}
                  className={`${inputStyle} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Viatura</label>
              <div className="relative">
                <Truck className="absolute left-3 top-3 text-slate-400" size={18} />
                <input name="viatura" value={form.viatura} onChange={handleChange} className={`${inputStyle} pl-10`} />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Guarnição</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 text-slate-400" size={18} />
                <input name="guarnicao" value={form.guarnicao} onChange={handleChange} className={`${inputStyle} pl-10`} />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Lacre</label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
                <input name="lacre" value={form.lacre} onChange={handleChange} className={`${inputStyle} pl-10`} />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Guia</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-3 text-slate-400" size={18} />
                <input name="guia" value={form.guia} onChange={handleChange} className={`${inputStyle} pl-10`} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelStyle}>Origem / Destino</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
              <input name="origem_destino" value={form.origem_destino} onChange={handleChange} className={`${inputStyle} pl-10`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <input type="number" name="colchao_qtd" value={form.colchao_qtd} onChange={handleChange} className={inputStyle} />
            <input type="number" name="kit_dorm_qtd" value={form.kit_dorm_qtd} onChange={handleChange} className={inputStyle} />
          </div>

          {/* UPLOAD */}
          <div>
            <label className={labelStyle}>Documento (PDF)</label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
          </div>

          {/* PREVIEW (SOMENTE ARQUIVO NOVO) */}
          {previewUrl && (
            <iframe src={previewUrl} className="w-full h-48 border rounded-xl" />
          )}

          <textarea
            name="observacao"
            value={form.observacao}
            onChange={handleChange}
            className={inputStyle}
            placeholder="Observações"
          />
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}
