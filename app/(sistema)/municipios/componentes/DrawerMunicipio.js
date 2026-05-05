/* app/(sistema)/municipios/componentes/DrawerMunicipio.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

import ListaDocumentos from "./documentos/ListaDocumentos"
import UploadDocumento from "./documentos/UploadDocumento"
import ListaBarragens from "./barragens/ListaBarragens"

import {
  X,
  Save,
  Loader2,
  Building2,
  FileText,
  AlertTriangle,
  Waves 
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

  const estadoInicial = {
    id: null,
    nome: "",
    prefeito: "",
    prefeito_contato: "",
    prefeito_contato_2: "", // Novo
    vice: "",
    vice_contato: "",
    vice_contato_2: "", // Novo
    chefe_gabinete: "",
    chefe_gabinete_contato: "",
    chefe_gabinete_contato_2: "", // Novo
    endereco_prefeitura: "",
    email_prefeitura: "",
    secretario_dc: "",
    secretario_dc_contato: "",
    secretario_dc_contato_2: "", // Novo
    subsecretario_dc: "",
    subsecretario_dc_contato: "",
    subsecretario_dc_contato_2: "", // Novo
    endereco_dc: "",
    email_dc: "",
    possui_barragem: false
  }

  const [form, setForm] = useState(estadoInicial)
  const [documentos, setDocumentos] = useState([])

  // ===============================
  // MÁSCARA DE TELEFONE (XX) XXXXX-XXXX
  // ===============================
  const maskPhone = (value) => {
    if (!value) return ""
    value = value.replace(/\D/g, "")
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2")
    value = value.replace(/(\d{5})(\d)/, "$1-$2")
    return value.length > 15 ? value.substring(0, 15) : value
  }

  const handlePhoneChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: maskPhone(value) }))
  }

  // ===============================
  // CARREGAR MUNICÍPIO
  // ===============================
  useEffect(() => {
    if (municipio) {
      setForm(prev => ({ 
        ...estadoInicial, 
        ...municipio 
      }))
    } else {
      setForm(estadoInicial)
    }
    setAba("dados")
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
    await supabase.storage.from("municipios-documentos").remove([doc.arquivo_nome])
    await supabase.from("municipios_documentos").delete().eq("id", doc.id)
    carregarDocs()
  }

  // ===============================
  // EVENTOS DO MUNICÍPIO
  // ===============================
  function getEventosDoMunicipio() {
    if (!municipio) return []
    const vinculos = eventosMunicipios.filter(em => em.municipio_id === municipio.id)
    return vinculos.map(v => {
      const evento = eventos.find(e => e.id === v.evento_id)
      const dados = dadosEventos.find(d => d.evento_municipio_id === v.id)
      return { ...evento, dados }
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
      const { error } = await supabase.from("municipios").upsert(payload)
      if (error) throw error
      onSaved()
      onClose()
    } catch (err) {
      alert("Erro: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

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
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b px-4 bg-slate-50 overflow-x-auto no-scrollbar">
          {[
            { id: "dados", label: "Dados", icon: Building2, disabled: false },
            { id: "barragens", label: "Barragens", icon: Waves, disabled: !municipio }, 
            { id: "eventos", label: "Eventos", icon: AlertTriangle, disabled: !municipio },
            { id: "documentos", label: "Docs", icon: FileText, disabled: !municipio }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => !t.disabled && setAba(t.id)}
              disabled={t.disabled}
              className={`flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase border-b-2 whitespace-nowrap transition-colors ${
                aba === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
              } ${t.disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* ================= DADOS ================= */}
          {aba === "dados" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Nome do Município
                </label>
                <input
                  className="w-full p-4 bg-slate-100 rounded-xl font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.nome}
                  onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>

              {/* ESTRUTURA POLÍTICA */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Building2 size={12} /> Estrutura Política
                </h3>
                
                {/* Prefeito */}
                <div className="space-y-2">
                  <input
                    placeholder="Nome do Prefeito"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                    value={form.prefeito}
                    onChange={(e) => setForm(prev => ({ ...prev, prefeito: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Contato 1"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.prefeito_contato}
                      onChange={(e) => handlePhoneChange('prefeito_contato', e.target.value)}
                    />
                    <input
                      placeholder="Contato 2"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.prefeito_contato_2}
                      onChange={(e) => handlePhoneChange('prefeito_contato_2', e.target.value)}
                    />
                  </div>
                </div>

                {/* Vice-Prefeito */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <input
                    placeholder="Vice-Prefeito"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                    value={form.vice}
                    onChange={(e) => setForm(prev => ({ ...prev, vice: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Contato 1"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.vice_contato}
                      onChange={(e) => handlePhoneChange('vice_contato', e.target.value)}
                    />
                    <input
                      placeholder="Contato 2"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.vice_contato_2}
                      onChange={(e) => handlePhoneChange('vice_contato_2', e.target.value)}
                    />
                  </div>
                </div>

                {/* Chefe de Gabinete */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <input
                    placeholder="Chefe de Gabinete"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                    value={form.chefe_gabinete}
                    onChange={(e) => setForm(prev => ({ ...prev, chefe_gabinete: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Contato 1"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.chefe_gabinete_contato}
                      onChange={(e) => handlePhoneChange('chefe_gabinete_contato', e.target.value)}
                    />
                    <input
                      placeholder="Contato 2"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.chefe_gabinete_contato_2}
                      onChange={(e) => handlePhoneChange('chefe_gabinete_contato_2', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                   <input
                    placeholder="Endereço Prefeitura"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                    value={form.endereco_prefeitura}
                    onChange={(e) => setForm(prev => ({ ...prev, endereco_prefeitura: e.target.value }))}
                  />
                  <input
                    placeholder="Email institucional"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                    value={form.email_prefeitura}
                    onChange={(e) => setForm(prev => ({ ...prev, email_prefeitura: e.target.value }))}
                  />
                </div>
              </div>

              {/* DEFESA CIVIL */}
              <div className="bg-blue-50/50 p-4 rounded-2xl space-y-4 border border-blue-100">
                <h3 className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2">
                  <AlertTriangle size={12} /> Gestão de Defesa Civil
                </h3>
                
                {/* Secretário */}
                <div className="space-y-2">
                  <input
                    placeholder="Secretário Municipal"
                    className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm"
                    value={form.secretario_dc}
                    onChange={(e) => setForm(prev => ({ ...prev, secretario_dc: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Contato 1"
                      className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm"
                      value={form.secretario_dc_contato}
                      onChange={(e) => handlePhoneChange('secretario_dc_contato', e.target.value)}
                    />
                    <input
                      placeholder="Contato 2"
                      className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm"
                      value={form.secretario_dc_contato_2}
                      onChange={(e) => handlePhoneChange('secretario_dc_contato_2', e.target.value)}
                    />
                  </div>
                </div>

                {/* Subsecretário */}
                <div className="space-y-2 pt-2 border-t border-blue-100">
                  <input
                    placeholder="Subsecretário"
                    className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm"
                    value={form.subsecretario_dc}
                    onChange={(e) => setForm(prev => ({ ...prev, subsecretario_dc: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Contato 1"
                      className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm"
                      value={form.subsecretario_dc_contato}
                      onChange={(e) => handlePhoneChange('subsecretario_dc_contato', e.target.value)}
                    />
                    <input
                      placeholder="Contato 2"
                      className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm"
                      value={form.subsecretario_dc_contato_2}
                      onChange={(e) => handlePhoneChange('subsecretario_dc_contato_2', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-blue-100">
                  <input
                    placeholder="Endereço da Defesa Civil"
                    className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm"
                    value={form.endereco_dc}
                    onChange={(e) => setForm(prev => ({ ...prev, endereco_dc: e.target.value }))}
                  />
                  <input
                    placeholder="Email Defesa Civil"
                    className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm"
                    value={form.email_dc}
                    onChange={(e) => setForm(prev => ({ ...prev, email_dc: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <input
                  type="checkbox"
                  id="chk_barragem"
                  className="w-5 h-5 rounded-md accent-amber-600"
                  checked={form.possui_barragem}
                  onChange={(e) => setForm(prev => ({ ...prev, possui_barragem: e.target.checked }))}
                />
                <label htmlFor="chk_barragem" className="text-xs font-black uppercase text-amber-700 cursor-pointer">
                  Município possui barragem cadastrada
                </label>
              </div>
            </div>
          )}

          {/* ================= BARRAGENS ================= */}
          {aba === "barragens" && municipio && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {!form.possui_barragem ? (
                <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                   <Waves className="text-slate-300" size={32} />
                   <p className="text-xs text-slate-400 font-bold uppercase">
                     Habilite o check de barragens nos dados gerais
                   </p>
                </div>
              ) : (
                <ListaBarragens municipioId={municipio.id} />
              )}
            </div>
          )}

          {/* ================= EVENTOS ================= */}
          {aba === "eventos" && municipio && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {getEventosDoMunicipio().length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    Nenhum evento registrado nesta localidade
                  </p>
                </div>
              ) : (
                getEventosDoMunicipio().map(ev => (
                  <div key={ev.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-black uppercase text-slate-700 leading-tight">
                        {ev.titulo}
                      </h3>
                      <span className={`text-[8px] font-black px-2 py-1 rounded-full ${ev.tipo === 'SE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {ev.tipo}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-blue-600 mt-1">{ev.cobrade}</p>
                    {ev.dados && (
                      <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-50">
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 font-bold uppercase">Desaloj.</p>
                          <p className="text-xs font-black text-slate-700">{ev.dados.desalojados}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 font-bold uppercase">Desabr.</p>
                          <p className="text-xs font-black text-slate-700">{ev.dados.desabrigados}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 font-bold uppercase">Afetad.</p>
                          <p className="text-xs font-black text-slate-700">{ev.dados.afetados}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ================= DOCUMENTOS ================= */}
          {aba === "documentos" && municipio && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <UploadDocumento
                municipioId={municipio.id}
                onUploaded={carregarDocs}
              />
              <div className="pt-4">
                <ListaDocumentos
                  documentos={documentos}
                  onDelete={deletarDocumento}
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t bg-slate-50">
          <button
            onClick={salvarMunicipio}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white p-5 rounded-2xl flex justify-center items-center gap-3 font-black uppercase text-xs transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Processando..." : "Salvar Alterações"}
          </button>
        </div>

      </div>
    </div>
  )
}
