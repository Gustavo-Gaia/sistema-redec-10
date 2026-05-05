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
  Waves,
  Phone,
  Mail,
  MapPin,
  User
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
  const [documentos, setDocumentos] = useState([])

  const estadoInicial = {
    id: null,
    nome: "",
    prefeito: "",
    prefeito_contato: "",
    prefeito_contato_2: "",
    vice: "",
    vice_contato: "",
    vice_contato_2: "",
    chefe_gabinete: "",
    chefe_gabinete_contato: "",
    chefe_gabinete_contato_2: "",
    endereco_prefeitura: "",
    email_prefeitura: "",
    secretario_dc: "",
    funcao_gestor_dc: "Secretário",
    secretario_dc_contato: "",
    secretario_dc_contato_2: "",
    subsecretario_dc: "",
    subsecretario_dc_contato: "",
    subsecretario_dc_contato_2: "",
    endereco_dc: "",
    email_dc: "",
    possui_barragem: false
  }

  const [form, setForm] = useState(estadoInicial)

  // Mascaramento de Telefone
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

  // Efeito para carregar dados do município
  useEffect(() => {
    if (municipio) {
      setForm(prev => ({ ...estadoInicial, ...municipio }))
    } else {
      setForm(estadoInicial)
    }
    setAba("dados")
  }, [municipio])

  // Lógica de Documentos
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
    if (!confirm("Deseja realmente excluir este documento?")) return
    try {
      await supabase.storage.from("municipios-documentos").remove([doc.arquivo_nome])
      await supabase.from("municipios_documentos").delete().eq("id", doc.id)
      carregarDocs()
    } catch (error) {
      alert("Erro ao deletar: " + error.message)
    }
  }

  // Lógica de Eventos Relacionados
  function getEventosDoMunicipio() {
    if (!municipio) return []
    const vinculos = eventosMunicipios.filter(em => em.municipio_id === municipio.id)
    return vinculos.map(v => {
      const evento = eventos.find(e => e.id === v.evento_id)
      const dados = dadosEventos.find(d => d.evento_municipio_id === v.id)
      return { ...evento, dados }
    }).filter(e => e.id)
  }

  // Ação de Salvar
  async function salvarMunicipio() {
    if (!form.nome) return alert("O nome do município é obrigatório.")
    
    setLoading(true)
    try {
      const payload = { 
        ...form, 
        nome: form.nome.toUpperCase().trim() 
      }
      const { error } = await supabase.from("municipios").upsert(payload)
      if (error) throw error
      onSaved()
      onClose()
    } catch (err) {
      alert("Erro ao salvar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Componentes Auxiliares de UI
  const FieldLabel = ({ children }) => (
    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 block mb-1">
      {children}
    </label>
  )

  const InputSectionHeader = ({ icon: Icon, title, colorClass = "text-slate-500" }) => (
    <h3 className={`text-[10px] font-black uppercase flex items-center gap-2 mb-4 ${colorClass}`}>
      <Icon size={12} /> {title}
    </h3>
  )

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase text-slate-800 leading-tight">
              {municipio ? form.nome : "Novo Município"}
            </h2>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider">Gestão Territorial REDEC 10</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex border-b px-4 bg-slate-50 overflow-x-auto no-scrollbar scroll-smooth">
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
              className={`flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase border-b-2 whitespace-nowrap transition-all ${
                aba === t.id ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-slate-400 hover:text-slate-600"
              } ${t.disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {aba === "dados" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* NOME PRINCIPAL */}
              <div className="bg-white">
                <FieldLabel>Nome do Município</FieldLabel>
                <input
                  className="w-full p-4 bg-slate-100 rounded-2xl font-black text-lg uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-shadow border-transparent focus:bg-white border-2"
                  placeholder="EX: ITAPERUNA"
                  value={form.nome}
                  onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>

              {/* ESTRUTURA POLÍTICA */}
              <div className="bg-slate-50 p-5 rounded-3xl space-y-6 border border-slate-100 shadow-sm">
                <InputSectionHeader icon={User} title="Estrutura Política" />
                
                {/* Prefeito */}
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Prefeito(a)</FieldLabel>
                    <input
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold placeholder:font-normal"
                      placeholder="Nome completo"
                      value={form.prefeito}
                      onChange={(e) => setForm(prev => ({ ...prev, prefeito: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Contato 1"
                      className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.prefeito_contato}
                      onChange={(e) => handlePhoneChange('prefeito_contato', e.target.value)}
                    />
                    <input
                      placeholder="Contato 2"
                      className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.prefeito_contato_2}
                      onChange={(e) => handlePhoneChange('prefeito_contato_2', e.target.value)}
                    />
                  </div>
                </div>

                {/* Vice */}
                <div className="space-y-3 pt-4 border-t border-slate-200/60">
                  <FieldLabel>Vice-Prefeito(a)</FieldLabel>
                  <input
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                    value={form.vice}
                    onChange={(e) => setForm(prev => ({ ...prev, vice: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Contato 1"
                      className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.vice_contato}
                      onChange={(e) => handlePhoneChange('vice_contato', e.target.value)}
                    />
                    <input
                      placeholder="Contato 2"
                      className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      value={form.vice_contato_2}
                      onChange={(e) => handlePhoneChange('vice_contato_2', e.target.value)}
                    />
                  </div>
                </div>

                {/* Localização e Email Prefeitura */}
                <div className="space-y-3 pt-4 border-t border-slate-200/60">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <FieldLabel>Endereço Prefeitura</FieldLabel>
                      <input
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs"
                        value={form.endereco_prefeitura}
                        onChange={(e) => setForm(prev => ({ ...prev, endereco_prefeitura: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>E-mail Gabinete</FieldLabel>
                    <input
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs"
                      value={form.email_prefeitura}
                      onChange={(e) => setForm(prev => ({ ...prev, email_prefeitura: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* DEFESA CIVIL */}
              <div className="bg-blue-50/40 p-5 rounded-3xl space-y-6 border border-blue-100 shadow-sm">
                <InputSectionHeader icon={AlertTriangle} title="Gestão de Defesa Civil" colorClass="text-blue-600" />
                
                <div className="space-y-3">
                  <FieldLabel>Gestor da Pasta</FieldLabel>
                  <div className="flex gap-2">
                    <select 
                      className="w-[110px] p-3 bg-white border border-blue-100 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-400 transition-all cursor-pointer"
                      value={form.funcao_gestor_dc}
                      onChange={(e) => setForm(prev => ({ ...prev, funcao_gestor_dc: e.target.value }))}
                    >
                      <option value="Secretário">Sec.</option>
                      <option value="Coordenador">Coord.</option>
                      <option value="Diretor">Dir.</option>
                    </select>
                    <input
                      placeholder="Nome do Secretário/Coord."
                      className="flex-1 p-3 bg-white border border-blue-100 rounded-xl text-sm font-bold"
                      value={form.secretario_dc}
                      onChange={(e) => setForm(prev => ({ ...prev, secretario_dc: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Celular Gestor"
                      className="p-3 bg-white border border-blue-100 rounded-xl text-sm"
                      value={form.secretario_dc_contato}
                      onChange={(e) => handlePhoneChange('secretario_dc_contato', e.target.value)}
                    />
                    <input
                      placeholder="Telefone Fixo/Institucional"
                      className="p-3 bg-white border border-blue-100 rounded-xl text-sm"
                      value={form.secretario_dc_contato_2}
                      onChange={(e) => handlePhoneChange('secretario_dc_contato_2', e.target.value)}
                    />
                  </div>
                </div>

                {/* Subsecretário */}
                <div className="space-y-3 pt-4 border-t border-blue-100/60">
                  <FieldLabel>Adjunto / Operacional</FieldLabel>
                  <input
                    placeholder="Nome do Subsecretário"
                    className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm font-bold"
                    value={form.subsecretario_dc}
                    onChange={(e) => setForm(prev => ({ ...prev, subsecretario_dc: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Contato"
                      className="p-3 bg-white border border-blue-100 rounded-xl text-sm"
                      value={form.subsecretario_dc_contato}
                      onChange={(e) => handlePhoneChange('subsecretario_dc_contato', e.target.value)}
                    />
                  </div>
                </div>

                {/* Contatos Institucionais DC */}
                <div className="space-y-3 pt-4 border-t border-blue-100/60">
                  <div>
                    <FieldLabel>Endereço da Sede (COMPDEC)</FieldLabel>
                    <input
                      className="w-full p-3 bg-white border border-blue-100 rounded-xl text-xs"
                      value={form.endereco_dc}
                      onChange={(e) => setForm(prev => ({ ...prev, endereco_dc: e.target.value }))}
                    />
                  </div>
                  <div>
                    <FieldLabel>E-mail Institucional Defesa Civil</FieldLabel>
                    <input
                      className="w-full p-3 bg-white border border-blue-100 rounded-xl text-xs"
                      value={form.email_dc}
                      onChange={(e) => setForm(prev => ({ ...prev, email_dc: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* BARRAGENS TOGGLE */}
              <div className={`flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 ${form.possui_barragem ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="chk_barragem"
                    className="sr-only peer"
                    checked={form.possui_barragem}
                    onChange={(e) => setForm(prev => ({ ...prev, possui_barragem: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-amber-600"></div>
                </div>
                <label htmlFor="chk_barragem" className="text-[10px] font-black uppercase text-slate-700 cursor-pointer select-none">
                  O Município possui barragens registradas?
                </label>
              </div>
            </div>
          )}

          {aba === "barragens" && municipio && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {!form.possui_barragem ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8">
                   <div className="p-4 bg-white rounded-full shadow-sm">
                      <Waves className="text-slate-300" size={40} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-xs text-slate-500 font-black uppercase">Módulo Desabilitado</p>
                     <p className="text-[10px] text-slate-400">Ative o switch de barragens na aba "Dados" para gerenciar as estruturas deste município.</p>
                   </div>
                </div>
              ) : (
                <ListaBarragens 
                  municipioId={municipio.id} 
                  municipioNome={form.nome} /* IMPORTANTE: Passando o nome para o Modal */
                />
              )}
            </div>
          )}

          {aba === "eventos" && municipio && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {getEventosDoMunicipio().length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <AlertTriangle className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Nenhum evento registrado</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {getEventosDoMunicipio().map(ev => (
                    <div key={ev.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-[11px] font-black uppercase text-slate-700 leading-tight">{ev.titulo}</h3>
                          <p className="text-[9px] font-bold text-blue-600 mt-1 tracking-tight">{ev.cobrade}</p>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-1 rounded-lg shrink-0 ${ev.tipo === 'SE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {ev.tipo === 'SE' ? 'SIT. EMERGÊNCIA' : 'CALAMIDADE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {aba === "documentos" && municipio && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200">
                <UploadDocumento municipioId={municipio.id} onUploaded={carregarDocs} />
              </div>
              <div className="space-y-3">
                <InputSectionHeader icon={FileText} title="Documentos Arquivados" />
                <ListaDocumentos documentos={documentos} onDelete={deletarDocumento} />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER - BOTÃO SALVAR */}
        <div className="p-6 border-t bg-slate-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button
            onClick={salvarMunicipio}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white p-5 rounded-2xl flex justify-center items-center gap-3 font-black uppercase text-xs transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Gravando Dados..." : municipio ? "Atualizar Município" : "Cadastrar Município"}
          </button>
        </div>

      </div>
    </div>
  )
}
