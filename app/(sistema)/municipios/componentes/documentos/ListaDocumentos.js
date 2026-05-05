/* app/(sistema)/municipios/componentes/documentos/ListaDocumentos.js */

"use client"

import { FileText, Download, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ListaDocumentos({
  documentos = [],
  onDelete
}) {

  function getUrl(nome) {
    const { data } = supabase.storage
      .from("municipios-documentos")
      .getPublicUrl(nome)

    return data.publicUrl
  }

  return (
    <div className="space-y-3">

      {documentos.length === 0 && (
        <p className="text-xs text-slate-400 font-bold uppercase text-center py-6">
          Nenhum documento enviado
        </p>
      )}

      {documentos.map((doc) => {
        const url = getUrl(doc.arquivo_nome)

        return (
          <div
            key={doc.id}
            className="p-4 bg-white rounded-xl border flex justify-between items-center"
          >

            <div className="flex items-center gap-3">
              <FileText className="text-blue-500" />

              <div>
                <p className="text-xs font-bold uppercase text-slate-700">
                  {doc.tipo}
                </p>
                <p className="text-[10px] text-slate-400">
                  {doc.arquivo_nome}
                </p>
              </div>
            </div>

            <div className="flex gap-2">

              <a
                href={url}
                target="_blank"
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Download size={16} />
              </a>

              <button
                onClick={() => onDelete(doc)}
                className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
              >
                <Trash2 size={16} />
              </button>

            </div>

          </div>
        )
      })}

    </div>
  )
}
