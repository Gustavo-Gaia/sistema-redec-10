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

  useEffect(() => {
    if (multa) {
      setForm({
        ...multa,
        data_infracao: multa.data_infracao?.slice(0, 10) || ""
      })
    }
  }, [multa])

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  async function handleSubmit() {
    if (!form.viatura_id) {
      alert("Selecione a viatura")
      return
    }

    setLoading(true)

    await onSave({
      ...form,
      valor: form.valor ? Number(form.valor) : null
    }, multa?.id)

    setLoading(false)
  }

  const input = "w-full border rounded-xl px-4 py-2 bg-slate-50"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white rounded-2xl w-full max-w-lg">

        <div className="p-4 border-b flex justify-between">
          <div className="flex gap-2 font-bold">
            <FileWarning />
            {multa ? "Editar Multa" : "Nova Multa"}
          </div>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="p-4 space-y-3">

          <select name="viatura_id" value={form.viatura_id} onChange={handleChange} className={input}>
            <option value="">Selecione a viatura</option>
            {viaturas.map(v => (
              <option key={v.id} value={v.id}>{v.prefixo}</option>
            ))}
          </select>

          <input type="date" name="data_infracao" value={form.data_infracao} onChange={handleChange} className={input} />

          <input type="time" name="hora" value={form.hora} onChange={handleChange} className={input} />

          <input name="local" placeholder="Local" value={form.local} onChange={handleChange} className={input} />

          <input type="number" name="valor" placeholder="Valor" value={form.valor} onChange={handleChange} className={input} />

          <input name="orgao" placeholder="Órgão" value={form.orgao} onChange={handleChange} className={input} />

          <select name="status" value={form.status} onChange={handleChange} className={input}>
            <option>PENDENTE</option>
            <option>PAGO</option>
            <option>RECURSO</option>
          </select>

          <textarea name="observacao" placeholder="Observação" value={form.observacao} onChange={handleChange} className={input} />

        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit} className="bg-red-600 text-white px-6 py-2 rounded-xl">
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  )
}
