/* app/(sistema)/municipios/componentes/barragens/ModalBarragem.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Loader2 } from "lucide-react"

export default function ModalBarragem({
  barragem,
  municipioId,
  onClose,
  onSaved
}) {

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    codigo_snisb: "",
    nome: "",
    empreendedor: "",
    uso_principal: "",
    ici: "",
    cri: "",
    dpa: "",
    classe_residuo: ""
  })

  useEffect(() => {
    if (barragem) setForm(barragem)
  }, [barragem])

  async function salvar() {
    setLoading(true)

    try {
      const payload = {
        ...form,
        municipio_id: municipioId
      }

      if (barragem?.id) {
        await supabase
          .from("barragens")
          .update(payload)
          .eq("id", barragem.id)
      } else {
        await supabase.from("barragens").insert(payload)
      }

      onSaved()

    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">

      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="bg-white w-full max-w-xl p-6 rounded-2xl space-y-4">

        <div className="flex justify-between">
          <h2 className="font-bold text-sm">
            {barragem ? "Editar Barragem" : "Nova Barragem"}
          </h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">

          <input placeholder="Código SNISB"
            value={form.codigo_snisb}
            onChange={e => setForm({...form, codigo_snisb: e.target.value})}
            className="p-2 bg-slate-100 rounded"
          />

          <input placeholder="Nome"
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})}
            className="p-2 bg-slate-100 rounded col-span-2"
          />

          <input placeholder="Empreendedor"
            value={form.empreendedor}
            onChange={e => setForm({...form, empreendedor: e.target.value})}
            className="p-2 bg-slate-100 rounded col-span-2"
          />

          <input placeholder="Uso"
            value={form.uso_principal}
            onChange={e => setForm({...form, uso_principal: e.target.value})}
            className="p-2 bg-slate-100 rounded col-span-2"
          />

          <input placeholder="ICI"
            value={form.ici}
            onChange={e => setForm({...form, ici: e.target.value})}
            className="p-2 bg-slate-100 rounded"
          />

          <input placeholder="CRI"
            value={form.cri}
            onChange={e => setForm({...form, cri: e.target.value})}
            className="p-2 bg-slate-100 rounded"
          />

          <input placeholder="DPA"
            value={form.dpa}
            onChange={e => setForm({...form, dpa: e.target.value})}
            className="p-2 bg-slate-100 rounded"
          />

          <input placeholder="Classe Resíduo"
            value={form.classe_residuo}
            onChange={e => setForm({...form, classe_residuo: e.target.value})}
            className="p-2 bg-slate-100 rounded col-span-2"
          />

        </div>

        <button
          onClick={salvar}
          disabled={loading}
          className="w-full bg-slate-900 text-white p-3 rounded-xl flex justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          Salvar
        </button>

      </div>
    </div>
  )
}
