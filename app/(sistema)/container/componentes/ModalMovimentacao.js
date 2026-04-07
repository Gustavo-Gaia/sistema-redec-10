/* app/(sistema)/container/componentes/ModalMovimentacao.js */

"use client"

import { useEffect, useState } from "react"

export default function ModalMovimentacao({
  onClose,
  onSave,
  movimentacao // ← NOVO (para edição)
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

  // 🔥 MODO EDIÇÃO
  useEffect(() => {
    if (movimentacao) {
      setForm({
        ...movimentacao,
        data_hora: movimentacao.data_hora?.slice(0, 16)
      })
      setPreviewUrl(movimentacao.arquivo_url || null)
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
      movimentacao?.id // ← IMPORTANTE (define update)
    )

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg font-semibold">
          {movimentacao ? "Editar Movimentação" : "Nova Movimentação"}
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

        <input
          type="datetime-local"
          name="data_hora"
          value={form.data_hora}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />

        <input placeholder="Viatura" name="viatura" value={form.viatura} onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input placeholder="Guarnição" name="guarnicao" value={form.guarnicao} onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input placeholder="Lacre" name="lacre" value={form.lacre} onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input placeholder="Origem/Destino" name="origem_destino" value={form.origem_destino} onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input placeholder="Guia" name="guia" value={form.guia} onChange={handleChange} className="w-full border p-2 rounded-lg" />

        <div className="flex gap-2">
          <input type="number" name="colchao_qtd" value={form.colchao_qtd} onChange={handleChange} placeholder="Colchões" className="w-1/2 border p-2 rounded-lg" />
          <input type="number" name="kit_dorm_qtd" value={form.kit_dorm_qtd} onChange={handleChange} placeholder="Kits" className="w-1/2 border p-2 rounded-lg" />
        </div>

        {/* Upload PDF */}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full border p-2 rounded-lg"
        />

        {/* 🔥 PREVIEW PDF */}
        {previewUrl && (
          <div className="border rounded-lg p-2">
            <p className="text-sm mb-2 text-gray-600">Pré-visualização:</p>
            <iframe
              src={previewUrl}
              className="w-full h-48 rounded"
            />
          </div>
        )}

        <textarea
          placeholder="Observação"
          name="observacao"
          value={form.observacao}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${
              loading
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? "Salvando..."
              : movimentacao
              ? "Atualizar"
              : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}
