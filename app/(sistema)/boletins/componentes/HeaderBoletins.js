/* app/(sistema)/boletins/componentes/HeaderBoletins.js */

"use client"

import { FileText, Plus } from "lucide-react"
import MarcadorLeitura from "./MarcadorLeitura"

export default function HeaderBoletins({ abaAtiva, onNovo, orgaoAtivo }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <FileText size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">Gestão Administrativa</span>
        </div>
        
        {/* Correção das crases para o título dinâmico */}
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {abaAtiva === "sei" ? "Controle de Processos SEI" : `Boletins ${orgaoAtivo}`}
        </h1>
        
        {/* Correção das crases para a descrição */}
        <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
          {abaAtiva === "sei" 
            ? "Monitore prazos e destinos de processos do Sistema Eletrônico de Informações." 
            : `Gerencie a leitura e o arquivamento de notas importantes dos boletins da ${orgaoAtivo}.`}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Marcador de Leitura (Sempre à esquerda do botão em telas maiores) */}
        {abaAtiva === "boletins" && (
          <div className="flex justify-center sm:justify-start">
            <MarcadorLeitura orgaoAtivo={orgaoAtivo} />
          </div>
        )}
        
        {/* Botão com largura total no mobile (items-stretch) e auto no desktop */}
        <button
          onClick={onNovo}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all justify-center whitespace-nowrap"
        >
          <Plus size={20} />
          {abaAtiva === "sei" ? "Novo Processo" : "Novo Registro"}
        </button>
      </div>
    </div>
  )
}
