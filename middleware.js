import { NextResponse } from "next/server"

export function middleware(request){

  const url = request.nextUrl.clone()

  const isLogin = url.pathname.startsWith("/login")

  const usuario = request.cookies.get("usuario")

  if(!usuario && !isLogin){
    url.pathname="/login"
    return NextResponse.redirect(url)
  }

}
