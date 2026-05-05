/* app/(sistema)/municipios/componentes/documentos/UploadDocumento.js */

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Upload, Loader2 } from "lucide-react"

export default function UploadDocumento({
  municipioId,
  onUploaded
}) {

  const [loading, setLoading] = useState(false)

  async function upload(file, tipo) {
    if (!file) return

    setLoading(true)

    try {
      const nomeLimpo = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^\w.-]/g, "")

      const fileName = `${municipioId}-${Date.now()}-${nomeLimpo}`

      const { error } = await supabase.storage
        .from("municipios-documentos")
        .upload(fileName, file)

      if (error) throw error

      await supabase.from("municipios_documentos").insert({
        municipio_id: municipioId,
        tipo,
        arquivo_nome: fileName
      })

      onUploaded()

    } catch (err) {
      alert("Erro upload: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFile(e, tipo) {
    const file = e.target.files[0]
    upload(file, tipo)
  }

  return (
    <div className="flex gap-2">

      <label className="cursor-pointer flex-1">
        <input type="file" hidden onChange={(e) => handleFile(e, "DIAGNOSE")} />
        <div className="p-4 border-2 border-dashed rounded-xl text-center text-xs font-bold text-blue-600">
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Upload Diagnose"}
        </div>
      </label>

      <label className="cursor-pointer flex-1">
        <input type="file" hidden onChange={(e) => handleFile(e, "PLANCON")} />
        <div className="p-4 border-2 border-dashed rounded-xl text-center text-xs font-bold text-green-600">
          Upload PLANCON
        </div>
      </label>

    </div>
  )
}
  
