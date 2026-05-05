/* app/(sistema)/municipios/componentes/DrawerMunicipio.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

import {
  X,
  Save,
  Loader2,
  Building2,
  User,
  Phone,
  Mail,
  MapPin
} from "lucide-react"

export default function DrawerMunicipio({
  municipio,
  onClose,
  onSaved
}) {

  const [aba, setAba] = useState("dados")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nome: "",
    prefeito: "",
    prefeito_contato: "",
    vice: "",
    vice_contato: "",
    chefe_gabinete: "",
    chefe_gabinete_contato: "",
    endereco_prefeitura: "",
    email_prefeitura: "",
    secretario_dc: "",
    secretario_dc_contato: "",
    subsecretario_dc: "",
    subsecretario_dc_contato: "",
    endereco_dc: "",
    email_dc: "",
    possui_barragem: false
  })

  // ===============================
  // CARREGAR DADOS
  // ===============================
  useEffect(() => {
    if (municipio) {
      setForm({
        ...form,
        ...municipio
      })
    }
  }, [municipio])

  // ===============================
  // SALVAR
  // ===============================
  async function salvarMunicipio() {
    setLoading(true)

    try {
      const payload = {
        ...form,
        nome: form.nome.toUpperCase()
      }

      const { error } = await supabase
        .from("municipios")
        .upsert(payload)

      if (error) throw error

      onSaved()
      onClose()

    } catch (err) {
      alert("Erro ao salvar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">

      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase">
              {municipio ? form.nome : "Novo Município"}
            </h2>
            <p className="text-[10px] text-blue-600 font-black uppercase mt-1">
              Cadastro Municipal
            </p>
          </div>

          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b px-4 bg-slate-50">
          {[
            { id: "dados", label: "Dados", icon: Building2 },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase border-b-2 ${
                aba === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {aba === "dados" && (
            <div className="space-y-4">

              {/* NOME */}
              <div>
                <label className="text-xs font-bold text-slate-400">
                  Nome do Município
                </label>
                <input
                  className="w-full p-4 bg-slate-100 rounded-xl"
                  value={form.nome}
                  onChange={(e) =>
                    setForm({ ...form, nome: e.target.value })
                  }
                />
              </div>

              {/* PREFEITO */}
              <div>
                <label className="text-xs font-bold text-slate-400">
                  Prefeito
                </label>
                <input
                  className="w-full p-4 bg-slate-100 rounded-xl"
                  value={form.prefeito}
                  onChange={(e) =>
                    setForm({ ...form, prefeito: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">
                  Contato Prefeito
                </label>
                <input
                  className="w-full p-4 bg-slate-100 rounded-xl"
                  value={form.prefeito_contato}
                  onChange={(e) =>
                    setForm({ ...form, prefeito_contato: e.target.value })
                  }
                />
              </div>

              {/* DEFESA CIVIL */}
              <div>
                <label className="text-xs font-bold text-slate-400">
                  Secretário Defesa Civil
                </label>
                <input
                  className="w-full p-4 bg-slate-100 rounded-xl"
                  value={form.secretario_dc}
                  onChange={(e) =>
                    setForm({ ...form, secretario_dc: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">
                  Contato
                </label>
                <input
                  className="w-full p-4 bg-slate-100 rounded-xl"
                  value={form.secretario_dc_contato}
                  onChange={(e) =>
                    setForm({ ...form, secretario_dc_contato: e.target.value })
                  }
                />
              </div>

              {/* CHECKBOX */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={form.possui_barragem}
                  onChange={(e) =>
                    setForm({ ...form, possui_barragem: e.target.checked })
                  }
                />
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Possui barragem
                </label>
              </div>

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t">
          <button
            disabled={loading}
            onClick={salvarMunicipio}
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {loading
              ? "SALVANDO..."
              : municipio
              ? "SALVAR ALTERAÇÕES"
              : "CADASTRAR MUNICÍPIO"}
          </button>
        </div>
      </div>
    </div>
  )
}
