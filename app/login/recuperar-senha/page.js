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

const { data } = await supabase
.from("usuarios")
.select("*")
.eq("rg",rg)
.single()

if(!data){
setMsg("Usuário não localizado")
setLoading(false)
return
}

const token = crypto.randomUUID()

await supabase
.from("usuarios")
.update({
reset_token:token,
reset_expira:new Date(Date.now()+3600000)
})
.eq("rg",rg)

await fetch("/api/enviar-email",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
email:data.email,
token
})
})

setMsg("Email de recuperação enviado")

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
<p className="text-center mt-4 text-red-500 text-sm">{msg}</p>
)}

</div>
</div>

)

}
