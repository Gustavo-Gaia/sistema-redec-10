/* middleware.js */

import { NextResponse } from "next/server"

export function middleware(request){

const url = request.nextUrl.clone()

const isLogin = url.pathname.startsWith("/login")

/* procura qualquer cookie do supabase */

const hasSupabaseCookie = request.cookies
.getAll()
.some(cookie => cookie.name.startsWith("sb-"))

/* se não estiver logado e tentar acessar páginas protegidas */

if(!hasSupabaseCookie && !isLogin){
url.pathname = "/login"
return NextResponse.redirect(url)
}

return NextResponse.next()

}

export const config = {
matcher:[
"/dashboard/:path*",
"/monitoramento/:path*",
"/equipe/:path*",
"/boletins/:path*",
"/agenda/:path*",
"/viaturas/:path*",
"/municipios/:path*",
"/patrimonio/:path*",
"/configuracoes/:path*"
]
}
