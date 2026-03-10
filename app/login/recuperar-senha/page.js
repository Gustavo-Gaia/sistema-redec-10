/* app/login/recuperar-senha/page.js*/

"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function RecuperarSenha(){

const [rg,setRg] = useState("")
const [msg,setMsg] = useState("")
const [loading,setLoading] = useState(false)

function somenteNumero(v){
return v.replace(/\D/g,"")
}

async function enviar(e){

e.preventDefault()

setLoading(true)
setMsg("")

/* busca email pelo RG */

const { data, error } = await supabase
.from("usuarios")
.select("email")
.eq("rg",rg)
.maybeSingle()

if(error || !data){
setMsg("Usuário não localizado")
setLoading(false)
return
}

/* envia email de recuperação */

const { error:resetError } = await supabase.auth.resetPasswordForEmail(
data.email,
{
redirectTo: `${window.location.origin}/login/nova-senha`
}
)

if(resetError){
console.log(resetError)
setMsg("Erro ao enviar email de recuperação")
setLoading(false)
return
}

setMsg("Email de recuperação enviado. Verifique sua caixa de entrada.")

setLoading(false)

}

return(

<div className="min-h-screen relative flex items-center justify-center overflow-hidden">

{/* LOGO GRANDE AO FUNDO */}

<div className="absolute inset-0 flex items-center justify-center opacity-10">

<Image
src="/logotipo_redec_norte.png"
alt="REDEC"
width={700}
height={700}
priority
/>

</div>

{/* OVERLAY */}

<div className="absolute inset-0 bg-slate-100/80"></div>

{/* CARD */}

<div className="relative w-full max-w-md">

<div className="bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">

{/* LOGO */}

<div className="text-center mb-6">

<Image
src="/logotipo_redec_norte.png"
alt="REDEC"
width={90}
height={90}
className="mx-auto mb-4"
priority
/>

<h1 className="text-xl font-bold">
Recuperar senha
</h1>

<p className="text-sm text-slate-500 mt-1">
Digite seu RG para receber o link de recuperação
</p>

</div>

{/* FORM */}

<form onSubmit={enviar} className="space-y-4">

<input
type="text"
placeholder="RG cadastrado"
value={rg}
onChange={(e)=>setRg(somenteNumero(e.target.value))}
className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
/>

<button
disabled={loading}
className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white py-2 rounded-lg font-semibold shadow-md"
>

{loading ? (
<>
<span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
Enviando...
</>
) : (
"Enviar link"
)}

</button>

</form>

{/* MENSAGEM */}

{msg && (
<p className="text-center mt-4 text-sm text-red-500">
{msg}
</p>
)}

{/* VOLTAR */}

<div className="text-center mt-6 text-sm">

<Link
href="/login"
className="text-blue-600 hover:underline font-medium"
>
Voltar para login
</Link>

</div>

</div>

</div>

</div>

)

}
