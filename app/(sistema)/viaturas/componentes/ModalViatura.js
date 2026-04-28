/* app/(sistema)/viaturas/componentes/ModalViatura.js */

"use client"

import { useEffect, useState } from "react"
import { X, Truck } from "lucide-react"

export default function ModalViatura({ onClose, onSave, viatura }) {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    prefixo: "",
    situacao: "OPERANTE",
    placa: "",
    renavan: "",
    chassi: "",
    ano_fabricacao: "",
    marca: "",
    modelo: "",
    observacao: ""
  })

  useEffect(() => {
    if (viatura) {
      setForm(viatura)
    }
  }, [viatura])

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  async function handleSubmit() {
    if (loading) return
    setLoading(true)

    await onSave({
      ...form,
      ano_fabricacao: Number(form.ano_fabricacao) || null
    })

    setLoading(false)
  }

  const input = "w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-slate-50 border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck />
            <h2 className="font-bold text-lg">
              {viatura ? "Editar Viatura" : "Nova Viatura"}
            </h2>
          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* FORM */}
        <div className="p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <input name="prefixo" value={form.prefixo} onChange={handleChange} placeholder="Prefixo (APC-038)" className={input} />
            
            <select name="situacao" value={form.situacao} onChange={handleChange} className={input}>
              <option value="OPERANTE">OPERANTE</option>
              <option value="INOPERANTE">INOPERANTE</option>
            </select>

            <input name="placa" value={form.placa} onChange={handleChange} placeholder="Placa" className={input} />
            <input name="renavan" value={form.renavan} onChange={handleChange} placeholder="Renavan" className={input} />

            <input name="chassi" value={form.chassi} onChange={handleChange} placeholder="Chassi" className={input} />
            <input name="ano_fabricacao" value={form.ano_fabricacao} onChange={handleChange} placeholder="Ano" className={input} />

            <input name="marca" value={form.marca} onChange={handleChange} placeholder="Marca" className={input} />
            <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Modelo" className={input} />
          </div>

          <textarea
            name="observacao"
            value={form.observacao}
            onChange={handleChange}
            placeholder="Observações"
            className={input}
          />

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600">
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
