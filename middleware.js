import { NextResponse } from "next/server"

export function middleware(request) {

  const url = request.nextUrl.clone()

  const isLogin = url.pathname.startsWith("/login")

  const usuario = request.cookies.get("usuario")

  if (!usuario && !isLogin) {
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
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
