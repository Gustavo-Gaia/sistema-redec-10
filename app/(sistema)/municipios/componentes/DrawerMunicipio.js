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
  FileText,
  AlertTriangle
} from "lucide-react"

export default function DrawerMunicipio({
  municipio,
  eventos = [],
  eventosMunicipios = [],
  dadosEventos = [],
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
    secretario_dc: "",
    secretario_dc_contato: "",
    possui_barragem: false
  })

  const [documentos, setDocumentos] = useState([])

  // ===============================
  // CARREGAR MUNICÍPIO
  // ===============================
  useEffect(() => {
    if (municipio) {
      setForm({ ...municipio })
    } else {
      setForm({
        id: null,
        nome: "",
        prefeito: "",
        prefeito_contato: "",
        secretario_dc: "",
        secretario_dc_contato: "",
        possui_barragem: false
      })
    }
  }, [municipio])

  // ===============================
  // DOCUMENTOS
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
    if (aba === "documentos") carregarDocs()
  }, [aba, municipio])

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
  // 🔥 EVENTOS DO MUNICÍPIO
  // ===============================
  function getEventosDoMunicipio() {
    if (!municipio) return []

    const vinculos = eventosMunicipios.filter(
      em => em.municipio_id === municipio.id
    )

    return vinculos.map(v => {
      const evento = eventos.find(e => e.id === v.evento_id)
      const dados = dadosEventos.find(d => d.evento_municipio_id === v.id)

      return {
        ...evento,
        dados
      }
    }).filter(Boolean)
  }

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
      alert("Erro: " + err.message)
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
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">

        {/* HEADER */}
        <div className="p-6 border-b bg-slate-50 flex justify-between">
          <div>
            <h2 className="text-xl font-black uppercase">
              {municipio ? form.nome : "Novo Município"}
            </h2>
            <p className="text-[10px] text-blue-600 font-black uppercase">
              Cadastro Municipal
            </p>
          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b px-4 bg-slate-50 overflow-x-auto">

          {[
            { id: "dados", label: "Dados", icon: Building2 },
            { id: "eventos", label: "Eventos", icon: AlertTriangle },
            { id: "documentos", label: "Documentos", icon: FileText }
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

          {/* ================= DADOS ================= */}
          {aba === "dados" && (
            <div className="space-y-6">
          
              {/* ================= NOME ================= */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Município
                </label>
                <input
                  className="w-full p-4 bg-slate-100 rounded-xl"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
          
              {/* ================= PREFEITURA ================= */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border">
                <h3 className="text-xs font-black text-slate-500 uppercase">
                  Prefeitura
                </h3>
          
                <input
                  placeholder="Prefeito"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.prefeito}
                  onChange={(e) => setForm({ ...form, prefeito: e.target.value })}
                />
          
                <input
                  placeholder="Contato Prefeito"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.prefeito_contato}
                  onChange={(e) => setForm({ ...form, prefeito_contato: e.target.value })}
                />
          
                <input
                  placeholder="Vice"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.vice}
                  onChange={(e) => setForm({ ...form, vice: e.target.value })}
                />
          
                <input
                  placeholder="Contato Vice"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.vice_contato}
                  onChange={(e) => setForm({ ...form, vice_contato: e.target.value })}
                />
          
                <input
                  placeholder="Chefe de Gabinete"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.chefe_gabinete}
                  onChange={(e) => setForm({ ...form, chefe_gabinete: e.target.value })}
                />
          
                <input
                  placeholder="Contato Chefe de Gabinete"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.chefe_gabinete_contato}
                  onChange={(e) =>
                    setForm({ ...form, chefe_gabinete_contato: e.target.value })
                  }
                />
          
                <input
                  placeholder="Endereço da Prefeitura"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.endereco_prefeitura}
                  onChange={(e) =>
                    setForm({ ...form, endereco_prefeitura: e.target.value })
                  }
                />
          
                <input
                  placeholder="Email da Prefeitura"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.email_prefeitura}
                  onChange={(e) =>
                    setForm({ ...form, email_prefeitura: e.target.value })
                  }
                />
              </div>
          
              {/* ================= DEFESA CIVIL ================= */}
              <div className="bg-blue-50 p-4 rounded-2xl space-y-4 border">
                <h3 className="text-xs font-black text-blue-600 uppercase">
                  Defesa Civil
                </h3>
          
                <input
                  placeholder="Secretário"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.secretario_dc}
                  onChange={(e) =>
                    setForm({ ...form, secretario_dc: e.target.value })
                  }
                />
          
                <input
                  placeholder="Contato Secretário"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.secretario_dc_contato}
                  onChange={(e) =>
                    setForm({ ...form, secretario_dc_contato: e.target.value })
                  }
                />
          
                <input
                  placeholder="Subsecretário"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.subsecretario_dc}
                  onChange={(e) =>
                    setForm({ ...form, subsecretario_dc: e.target.value })
                  }
                />
          
                <input
                  placeholder="Contato Subsecretário"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.subsecretario_dc_contato}
                  onChange={(e) =>
                    setForm({ ...form, subsecretario_dc_contato: e.target.value })
                  }
                />
          
                <input
                  placeholder="Endereço Defesa Civil"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.endereco_dc}
                  onChange={(e) =>
                    setForm({ ...form, endereco_dc: e.target.value })
                  }
                />
          
                <input
                  placeholder="Email Defesa Civil"
                  className="w-full p-3 bg-white rounded-xl"
                  value={form.email_dc}
                  onChange={(e) =>
                    setForm({ ...form, email_dc: e.target.value })
                  }
                />
              </div>
          
              {/* ================= BARRAGEM ================= */}
              <div className="flex items-center gap-3 pt-2">
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

          {/* ================= EVENTOS ================= */}
          {aba === "eventos" && (
            <div className="space-y-4">

              {!municipio && (
                <p className="text-xs text-amber-500 font-bold uppercase text-center">
                  Salve o município para visualizar eventos
                </p>
              )}

              {municipio && (
                <>
                  {getEventosDoMunicipio().length === 0 && (
                    <p className="text-center text-xs text-slate-400 font-bold uppercase">
                      Nenhum evento vinculado
                    </p>
                  )}

                  {getEventosDoMunicipio().map(ev => (
                    <div
                      key={ev.id}
                      className="bg-white border rounded-2xl p-4 shadow-sm"
                    >
                      <h3 className="text-xs font-black uppercase text-slate-700">
                        {ev.titulo}
                      </h3>

                      <p className="text-[10px] text-slate-500 mt-1">
                        {ev.tipo} • {ev.cobrade}
                      </p>

                      {ev.dados && (
                        <div className="mt-2 text-[10px] text-slate-600 space-y-1">
                          <p>Desalojados: {ev.dados.desalojados}</p>
                          <p>Desabrigados: {ev.dados.desabrigados}</p>
                          <p>Afetados: {ev.dados.afetados}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

            </div>
          )}

          {/* ================= DOCUMENTOS ================= */}
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
        <div className="p-6 border-t">
          <button
            onClick={salvarMunicipio}
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-2xl flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            {loading ? "SALVANDO..." : "SALVAR"}
          </button>
        </div>

      </div>
    </div>
  )
}
