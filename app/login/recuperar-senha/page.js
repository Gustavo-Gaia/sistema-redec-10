/* app/login/recuperar-senha/page.js*/

"use client"

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
.single()

if(error || !data){
setMsg("Usuário não localizado")
setLoading(false)
return
}

/* envia email de recuperação pelo Supabase */

const { error:resetError } = await supabase.auth.resetPasswordForEmail(
data.email,
{
redirectTo: `${window.location.origin}/login/nova-senha`
}
)

if(resetError){
setMsg("Erro ao enviar email de recuperação")
setLoading(false)
return
}

setMsg("Email de recuperação enviado. Verifique sua caixa de entrada.")

setLoading(false)

}

return(

<div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">

<div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

<h1 className="text-xl font-bold text-center mb-6">
Recuperar senha
</h1>

<form onSubmit={enviar} className="space-y-4">

<input
type="text"
placeholder="RG cadastrado"
value={rg}
onChange={(e)=>setRg(somenteNumero(e.target.value))}
className="w-full border p-2 rounded-lg"
/>

<button
disabled={loading}
className="w-full bg-blue-600 text-white py-2 rounded-lg"
>
{loading ? "Enviando..." : "Enviar link"}
</button>

</form>

{msg && (
<p className="text-center mt-4 text-red-500 text-sm">
{msg}
</p>
)}

</div>
</div>

)

}
