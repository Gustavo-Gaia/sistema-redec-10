/* app/(sistema)/municipios/componentes/DrawerMunicipio.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

import ListaDocumentos from "./documentos/ListaDocumentos"
import UploadDocumento from "./documentos/UploadDocumento"

import {
  X,
  Save,
  Loader2,
  Building2,
  FileText
} from "lucide-react"

export default function DrawerMunicipio({
  municipio,
  onClose,
  onSaved
}) {

  const [aba, setAba] = useState("dados")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    id: null,
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

  const [documentos, setDocumentos] = useState([])

  // ===============================
  // CARREGAR MUNICÍPIO
  // ===============================
  useEffect(() => {
    if (municipio) {
      setForm({
        ...municipio
      })
    } else {
      // RESET ao criar novo
      setForm({
        id: null,
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
    }
  }, [municipio])

  // ===============================
  // CARREGAR DOCUMENTOS
  // ===============================
  async function carregarDocs() {
    if (!municipio?.id) return

    const { data } = await supabase
      .from("municipios_documentos")
      .select("*")
      .eq("municipio_id", municipio.id)
      .order("created_at", { ascending: false })

    setDocumentos(data || [])
  }

  useEffect(() => {
    if (aba === "documentos") {
      carregarDocs()
    }
  }, [aba, municipio])

  // ===============================
  // DELETAR DOCUMENTO
  // ===============================
  async function deletarDocumento(doc) {
    if (!confirm("Excluir documento?")) return

    await supabase.storage
      .from("municipios-documentos")
      .remove([doc.arquivo_nome])

    await supabase
      .from("municipios_documentos")
      .delete()
      .eq("id", doc.id)

    carregarDocs()
  }

  // ===============================
  // SALVAR MUNICÍPIO
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
        <div className="flex border-b px-4 bg-slate-50 overflow-x-auto">

          {[
            { id: "dados", label: "Dados", icon: Building2 },
            { id: "documentos", label: "Documentos", icon: FileText }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase border-b-2 whitespace-nowrap ${
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

          {/* ===================== DADOS ===================== */}
          {aba === "dados" && (
            <div className="space-y-4">

              <input
                placeholder="Nome do Município"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />

              <input
                placeholder="Prefeito"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.prefeito}
                onChange={(e) => setForm({ ...form, prefeito: e.target.value })}
              />

              <input
                placeholder="Contato Prefeito"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.prefeito_contato}
                onChange={(e) => setForm({ ...form, prefeito_contato: e.target.value })}
              />

              <input
                placeholder="Secretário Defesa Civil"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.secretario_dc}
                onChange={(e) => setForm({ ...form, secretario_dc: e.target.value })}
              />

              <input
                placeholder="Contato Defesa Civil"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.secretario_dc_contato}
                onChange={(e) => setForm({ ...form, secretario_dc_contato: e.target.value })}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.possui_barragem}
                  onChange={(e) =>
                    setForm({ ...form, possui_barragem: e.target.checked })
                  }
                />
                <span className="text-xs font-bold uppercase text-slate-500">
                  Possui barragem
                </span>
              </div>

            </div>
          )}

          {/* ===================== DOCUMENTOS ===================== */}
          {aba === "documentos" && (
            <div className="space-y-4">

              {!municipio && (
                <p className="text-xs text-amber-500 font-bold uppercase text-center">
                  Salve o município antes de anexar documentos
                </p>
              )}

              {municipio && (
                <>
                  <UploadDocumento
                    municipioId={municipio.id}
                    onUploaded={carregarDocs}
                  />

                  <ListaDocumentos
                    documentos={documentos}
                    onDelete={deletarDocumento}
                  />
                </>
              )}

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t bg-white">
          <button
            disabled={loading}
            onClick={salvarMunicipio}
            className="w-full bg-slate-900 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
