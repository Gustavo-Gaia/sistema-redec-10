/* app/(sistema)/viaturas/componentes/ModalManutencao.js */

"use client"

import { useState, useEffect } from "react"
import { X, Wrench } from "lucide-react"

export default function ModalManutencao({
  onClose,
  onSave,
  manutencao,
  viaturas
}) {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    viatura_id: "",
    numero_os: "",
    data: "",
    execucao: "PARTICULAR",
    odometro: "",
    motivo: "",
    observacao: ""
  })

  useEffect(() => {
    if (manutencao) {
      setForm(manutencao)
    }
  }, [manutencao])

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  async function handleSubmit() {
    if (loading) return
    setLoading(true)

    try {
      await onSave(form, manutencao?.id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const input = "w-full border rounded-xl px-4 py-2 bg-slate-50"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl w-full max-w-lg">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2 font-bold">
            <Wrench />
            {manutencao ? "Editar Manutenção" : "Nova Manutenção"}
          </div>

          <button onClick={onClose}>
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
            name="numero_os"
            placeholder="Número OS"
            value={form.numero_os}
            onChange={handleChange}
            className={input}
          />

          <input
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
            className={input}
          />

          <select
            name="execucao"
            value={form.execucao}
            onChange={handleChange}
            className={input}
          >
            <option>PARTICULAR</option>
            <option>CSM</option>
          </select>

          <input
            name="odometro"
            placeholder="Odômetro"
            value={form.odometro}
            onChange={handleChange}
            className={input}
          />

          <input
            name="motivo"
            placeholder="Defeito / Motivo"
            value={form.motivo}
            onChange={handleChange}
            className={input}
          />

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
            className="px-4 py-2"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>

        </div>

      </div>
    </div>
  )
}
