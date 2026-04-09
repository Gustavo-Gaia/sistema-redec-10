/* app/(sistema)/boletins/componentes/HeaderBoletins.js */

"use client"

import { FileText, Plus } from "lucide-react"
import MarcadorLeitura from "./MarcadorLeitura"

export default function HeaderBoletins({ abaAtiva, onNovo }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <FileText size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">Gestão Administrativa</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {abaAtiva === "sei" ? "Controle de Processos SEI" : "Boletins SEDEC / DGDEC"}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {abaAtiva === "sei" 
            ? "Monitore prazos e destinos de processos do Sistema Eletrônico de Informações." 
            : "Gerencie a leitura e o arquivamento de notas importantes dos boletins oficiais."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Marcador de Leitura: Só aparece na aba de Boletins */}
        {abaAtiva === "boletins" && <MarcadorLeitura />}
        
        <button
          onClick={onNovo}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          {abaAtiva === "sei" ? "Novo Processo" : "Nova Nota de Boletim"}
        </button>
      </div>
    </div>
  )
}
