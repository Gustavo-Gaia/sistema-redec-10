/* app/login/aguardando-aprovacao/page.js */

"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"

export default function AguardandoAprovacao() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-100/80">
      {/* LOGO DE FUNDO */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <Image 
          src="/logotipo_redec_norte.png" 
          alt="REDEC" 
          width={700} 
          height={700} 
          priority 
        />
      </div>

      {/* CARD CENTRAL */}
      <div className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center border border-slate-200">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 text-amber-600 mb-6 animate-pulse">
          <Clock size={32} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Cadastro em Análise
        </h1>
        
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Sua solicitação de acesso foi enviada com sucesso ao **Administrador da REDEC 10**. 
          Sua conta será liberada assim que revisada.
        </p>

        <div className="border-t border-slate-100 pt-4">
          <Link href="/login" className="text-sm text-blue-600 hover:underline font-semibold">
            Voltar para a tela de Login
          </Link>
        </div>
      </div>
    </div>
  )
}
