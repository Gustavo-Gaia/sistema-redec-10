/* app/(sistema)/container/componentes/ModalMovimentacao.js */

import { useState } from "react"

export default function ModalMovimentacao({ onClose, onSave }) {
  const [file, setFile] = useState(null)

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

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  function handleSubmit() {
    onSave(
      {
        ...form,
        colchao_qtd: Number(form.colchao_qtd),
        kit_dorm_qtd: Number(form.kit_dorm_qtd)
      },
      file
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">

        <h2 className="text-lg font-semibold">
          Nova Movimentação
        </h2>

        {/* Tipo */}
        <select
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        >
          <option value="ENTRADA">Entrada</option>
          <option value="SAÍDA">Saída</option>
        </select>

        <input type="datetime-local" name="data_hora" value={form.data_hora} onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input placeholder="Viatura" name="viatura" onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input placeholder="Guarnição" name="guarnicao" onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input placeholder="Lacre" name="lacre" onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input placeholder="Origem/Destino" name="origem_destino" onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input placeholder="Guia" name="guia" onChange={handleChange} className="w-full border p-2 rounded-lg" />

        <div className="flex gap-2">
          <input type="number" name="colchao_qtd" placeholder="Colchões" onChange={handleChange} className="w-1/2 border p-2 rounded-lg" />
          <input type="number" name="kit_dorm_qtd" placeholder="Kits" onChange={handleChange} className="w-1/2 border p-2 rounded-lg" />
        </div>

        {/* Upload PDF */}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border p-2 rounded-lg"
        />

        <textarea placeholder="Observação" name="observacao" onChange={handleChange} className="w-full border p-2 rounded-lg" />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
