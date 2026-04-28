/* app/(sistema)/viaturas/componentes/ModalMulta.js */

"use client"

import { useState, useEffect } from "react"
import { X, FileWarning } from "lucide-react"

export default function ModalMulta({
  onClose,
  onSave,
  multa,
  viaturas
}) {

  const [form, setForm] = useState({
    viatura_id: "",
    data_infracao: "",
    hora: "",
    local: "",
    valor: "",
    orgao: "",
    status: "PENDENTE",
    observacao: ""
  })

  const [loading, setLoading] = useState(false)

  // ---------------- LOAD EDIÇÃO ----------------
  useEffect(() => {
    if (multa) {
      setForm({
        ...multa,
        data_infracao: multa.data_infracao?.slice(0, 10) || "",
        hora: multa.hora ? multa.hora.slice(0, 5) : ""
      })
    }
  }, [multa])

  // ---------------- INPUT ----------------
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // ---------------- SUBMIT ----------------
  async function handleSubmit() {
    if (loading) return

    if (!form.viatura_id) {
      alert("Selecione a viatura")
      return
    }

    try {
      setLoading(true)

      await onSave(
        {
          ...form,
          valor: form.valor ? Number(form.valor) : null
        },
        multa?.id
      )

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const input = "w-full border rounded-xl px-4 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-400"

  // ---------------- UI ----------------
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >

      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex gap-2 font-bold items-center text-slate-800">
            <FileWarning />
            {multa ? "Editar Multa" : "Nova Multa"}
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-600"
          >
            <X />
          </button>
        </div>

        {/* FORM */}
        <div className="p-4 space-y-3">

          <select
            name="viatura_id"
            value={form.viatura_id}
            onChange={handleChange}
            className={input}
          >
            <option value="">Selecione a viatura</option>
            {viaturas.map(v => (
              <option key={v.id} value={v.id}>
                {v.prefixo}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="data_infracao"
            value={form.data_infracao}
            onChange={handleChange}
            className={input}
          />

          <input
            type="time"
            name="hora"
            value={form.hora}
            onChange={handleChange}
            className={input}
          />

          <input
            name="local"
            placeholder="Local"
            value={form.local}
            onChange={handleChange}
            className={input}
          />

          <input
            type="number"
            name="valor"
            placeholder="Valor"
            value={form.valor}
            onChange={handleChange}
            className={input}
          />

          <input
            name="orgao"
            placeholder="Órgão"
            value={form.orgao}
            onChange={handleChange}
            className={input}
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={input}
          >
            <option value="PENDENTE">PENDENTE</option>
            <option value="PAGO">PAGO</option>
            <option value="RECURSO">RECURSO</option>
          </select>

          <textarea
            name="observacao"
            placeholder="Observação"
            value={form.observacao}
            onChange={handleChange}
            className={input}
          />

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-red-600"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>

        </div>

      </div>
    </div>
  )
}
