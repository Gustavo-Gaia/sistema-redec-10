/* app/(sistema)/viaturas/componentes/ModalViatura.js */

"use client"

import { useEffect, useState } from "react"
import { X, Truck } from "lucide-react"

// Estado inicial definido fora para reutilização
const initialState = {
  prefixo: "",
  situacao: "OPERANTE",
  placa: "",
  renavam: "",
  chassi: "",
  ano_fabricacao: "",
  marca: "",
  modelo: "",
  observacao: ""
}

export default function ModalViatura({ onClose, onSave, viatura }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(initialState)

  // Sincroniza o formulário quando a prop 'viatura' muda
  useEffect(() => {
    if (viatura) {
      setForm(viatura)
    } else {
      // Se viatura for null (clicou no +), reseta obrigatoriamente os campos
      setForm(initialState)
    }
  }, [viatura])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit() {
    if (loading) return
    setLoading(true)

    await onSave({
      ...form,
      ano_fabricacao: form.ano_fabricacao ? Number(form.ano_fabricacao) : null
    })

    setLoading(false)
  }

  const inputStyle = "w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
  const labelStyle = "block text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">

        {/* HEADER */}
        <div className="bg-slate-50 border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Truck size={20} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">
              {viatura ? "Editar Viatura" : "Cadastrar Nova Viatura"}
            </h2>
          </div>

          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* FORM */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Prefixo e Situação */}
            <div>
              <label className={labelStyle}>Prefixo</label>
              <input name="prefixo" value={form.prefixo} onChange={handleChange} placeholder="Ex: APC-038" className={inputStyle} />
            </div>

            <div>
              <label className={labelStyle}>Situação Atual</label>
              <select name="situacao" value={form.situacao} onChange={handleChange} className={inputStyle}>
                <option value="OPERANTE">✅ OPERANTE</option>
                <option value="INOPERANTE">❌ INOPERANTE</option>
              </select>
            </div>

            {/* Placa e Renavan */}
            <div>
              <label className={labelStyle}>Placa</label>
              <input name="placa" value={form.placa} onChange={handleChange} placeholder="Placa do veículo" className={inputStyle} />
            </div>

            <div>
              <label className={labelStyle}>Renavan</label>
              <input name="renavan" value={form.renavan} onChange={handleChange} placeholder="Código Renavan" className={inputStyle} />
            </div>

            {/* Chassi e Ano */}
            <div>
              <label className={labelStyle}>Chassi</label>
              <input name="chassi" value={form.chassi} onChange={handleChange} placeholder="Número do Chassi" className={inputStyle} />
            </div>

            <div>
              <label className={labelStyle}>Ano de Fabricação</label>
              <input name="ano_fabricacao" type="number" value={form.ano_fabricacao || ""} onChange={handleChange} placeholder="Ex: 2024" className={inputStyle} />
            </div>

            {/* Marca e Modelo */}
            <div>
              <label className={labelStyle}>Marca</label>
              <input name="marca" value={form.marca} onChange={handleChange} placeholder="Ex: Toyota, Ford..." className={inputStyle} />
            </div>

            <div>
              <label className={labelStyle}>Modelo</label>
              <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Ex: Hilux, Ranger..." className={inputStyle} />
            </div>

          </div>

          {/* Observações */}
          <div>
            <label className={labelStyle}>Observações Adicionais</label>
            <textarea
              name="observacao"
              value={form.observacao}
              onChange={handleChange}
              placeholder="Detalhes sobre a viatura, histórico ou lotação..."
              className={`${inputStyle} h-24 resize-none`}
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-slate-500 font-medium hover:bg-slate-200 rounded-xl transition-all"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'} text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all`}
          >
            {loading ? "Processando..." : (viatura ? "Atualizar Viatura" : "Salvar Viatura")}
          </button>
        </div>

      </div>
    </div>
  )
}
