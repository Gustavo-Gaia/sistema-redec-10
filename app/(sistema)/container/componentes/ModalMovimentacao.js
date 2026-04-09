/* app/(sistema)/container/componentes/ModalMovimentacao.js */

"use client"

import { useEffect, useState } from "react"
import { X, FileText, Truck, Users, Hash, MapPin, ClipboardList, Package, Calendar, Clock } from "lucide-react"

export default function ModalMovimentacao({
  onClose,
  onSave,
  movimentacao
}) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  // Estados separados para Data e Hora (como na Agenda)
  const [dataPart, setDataPart] = useState(new Date().toISOString().split('T')[0])
  const [horaPart, setHoraPart] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))

  const [form, setForm] = useState({
    tipo: "ENTRADA",
    viatura: "",
    guarnicao: "",
    lacre: "",
    origem_destino: "",
    guia: "",
    colchao_qtd: 0,
    kit_dorm_qtd: 0,
    observacao: ""
  })

  useEffect(() => {
    if (movimentacao && movimentacao.data_hora) {
      setForm({
        ...movimentacao
      })
      const dt = new Date(movimentacao.data_hora)
      setDataPart(dt.toISOString().split('T')[0])
      setHoraPart(dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
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

    // Recompõe a data e hora para o formato ISO antes de enviar
    const dataHoraComposta = `${dataPart}T${horaPart}:00`

    await onSave(
      {
        ...form,
        data_hora: dataHoraComposta,
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
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Operação */}
            <div className="md:col-span-2 bg-slate-100/50 p-1 rounded-2xl flex gap-1">
              <button 
                onClick={() => setForm({...form, tipo: 'ENTRADA'})}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${form.tipo === 'ENTRADA' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
              >
                🟢 ENTRADA
              </button>
              <button 
                onClick={() => setForm({...form, tipo: 'SAÍDA'})}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${form.tipo === 'SAÍDA' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
              >
                🟠 SAÍDA
              </button>
            </div>

            {/* Data e Hora Separadas */}
            <div>
              <label className={labelStyle}>Data</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="date"
                  value={dataPart}
                  onChange={(e) => setDataPart(e.target.value)}
                  className={`${inputStyle} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Hora</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="time"
                  value={horaPart}
                  onChange={(e) => setHoraPart(e.target.value)}
                  className={`${inputStyle} pl-10`}
                />
              </div>
            </div>

            {/* Viatura e Guarnição */}
            <div>
              <label className={labelStyle}>Viatura / Prefixo</label>
              <div className="relative">
                <Truck className="absolute left-3 top-3 text-slate-400" size={18} />
                <input name="viatura" value={form.viatura} onChange={handleChange} className={`${inputStyle} pl-10`} placeholder="Ex: ABSL-01" />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Guarnição / Responsável</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 text-slate-400" size={18} />
                <input name="guarnicao" value={form.guarnicao} onChange={handleChange} className={`${inputStyle} pl-10`} placeholder="Ex: Sgt Fulano" />
              </div>
            </div>

            {/* Lacre e Guia */}
            <div>
              <label className={labelStyle}>Número do Lacre</label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
                <input name="lacre" value={form.lacre} onChange={handleChange} className={`${inputStyle} pl-10`} placeholder="000000" />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Nº da Guia / Ofício</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-3 text-slate-400" size={18} />
                <input name="guia" value={form.guia} onChange={handleChange} className={`${inputStyle} pl-10`} placeholder="Ex: 123/2026" />
              </div>
            </div>
          </div>

          {/* Origem/Destino */}
          <div>
            <label className={labelStyle}>Origem ou Destino Final</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
              <input name="origem_destino" value={form.origem_destino} onChange={handleChange} className={`${inputStyle} pl-10`} placeholder="Ex: COMDEC Natividade" />
            </div>
          </div>

          {/* Quantidades */}
          <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <div>
              <label className={`${labelStyle} text-blue-600`}>Qtd. Colchões</label>
              <input type="number" name="colchao_qtd" value={form.colchao_qtd} onChange={handleChange} className={`${inputStyle} border-blue-200 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`${labelStyle} text-blue-600`}>Qtd. Kits Dormitório</label>
              <input type="number" name="kit_dorm_qtd" value={form.kit_dorm_qtd} onChange={handleChange} className={`${inputStyle} border-blue-200 focus:ring-blue-500`} />
            </div>
          </div>

          {/* Documento PDF */}
          <div className="space-y-2">
            <label className={labelStyle}>Documento Comprobatório (PDF)</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
              <div className="flex flex-col items-center justify-center">
                <FileText size={24} className="mb-1 text-slate-400" />
                <p className="text-xs text-slate-500">Clique para anexar a Guia Digitalizada</p>
              </div>
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {previewUrl && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-50">
              <div className="bg-slate-200/50 px-4 py-1.5 text-[10px] font-bold text-slate-500 flex justify-between">
                PRÉ-VISUALIZAÇÃO
                <button onClick={() => {setFile(null); setPreviewUrl(null)}} className="text-red-500">Remover</button>
              </div>
              <iframe src={previewUrl} className="w-full h-40" />
            </div>
          )}

          {/* Observação */}
          <div>
            <label className={labelStyle}>Observações</label>
            <textarea
              rows="2"
              name="observacao"
              value={form.observacao}
              onChange={handleChange}
              className={`${inputStyle} resize-none`}
              placeholder="Notas adicionais..."
            />
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-200 transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 transition-all ${
              loading ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? "Processando..." : movimentacao ? "Atualizar Registro" : "Salvar Movimentação"}
          </button>
        </div>
      </div>
    </div>
  )
}
