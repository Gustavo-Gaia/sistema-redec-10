"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function NovaSenha(){

const params = useSearchParams()
const token = params.get("token")

const [senha,setSenha] = useState("")
const [confirmar,setConfirmar] = useState("")
const [msg,setMsg] = useState("")

async function redefinir(e){

e.preventDefault()

if(senha !== confirmar){
setMsg("As senhas não conferem")
return
}

const { data } = await supabase
.from("usuarios")
.select("*")
.eq("reset_token",token)
.single()

if(!data){
setMsg("Token inválido")
return
}

await supabase
.from("usuarios")
.update({
senha,
reset_token:null,
reset_expira:null
})
.eq("id",data.id)

setMsg("Senha redefinida com sucesso")

}

return(

<div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">

<div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

<h1 className="text-xl font-bold text-center mb-6">
Nova senha
</h1>

<form onSubmit={redefinir} className="space-y-4">

<input
type="password"
placeholder="Nova senha"
value={senha}
onChange={(e)=>setSenha(e.target.value)}
className="w-full border p-2 rounded-lg"
/>

<input
type="password"
placeholder="Confirmar senha"
value={confirmar}
onChange={(e)=>setConfirmar(e.target.value)}
className="w-full border p-2 rounded-lg"
/>

<button className="w-full bg-blue-600 text-white py-2 rounded-lg">
Redefinir senha
</button>

</form>

{msg && (
<p className="text-center mt-4 text-red-500 text-sm">{msg}</p>
)}

</div>
</div>

)
}
