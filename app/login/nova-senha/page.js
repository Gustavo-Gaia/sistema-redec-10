/* app/login/nova-senha/page.js */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function NovaSenha(){

const router = useRouter()

const [senha,setSenha] = useState("")
const [confirmar,setConfirmar] = useState("")
const [msg,setMsg] = useState("")
const [loading,setLoading] = useState(false)

async function redefinir(e){

e.preventDefault()

setMsg("")
setLoading(true)

if(senha !== confirmar){
setMsg("As senhas não conferem")
setLoading(false)
return
}

const { error } = await supabase.auth.updateUser({
password:senha
})

if(error){
setMsg("Erro ao redefinir senha")
setLoading(false)
return
}

setMsg("Senha atualizada com sucesso!")

setTimeout(()=>{
router.push("/login")
},2000)

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
required
/>

<input
type="password"
placeholder="Confirmar nova senha"
value={confirmar}
onChange={(e)=>setConfirmar(e.target.value)}
className="w-full border p-2 rounded-lg"
required
/>

<button
disabled={loading}
className="w-full bg-blue-600 text-white py-2 rounded-lg"
>
{loading ? "Salvando..." : "Redefinir senha"}
</button>

</form>

{msg && (
<p className="text-center mt-4 text-sm text-blue-600">
{msg}
</p>
)}

</div>

</div>

)

}
