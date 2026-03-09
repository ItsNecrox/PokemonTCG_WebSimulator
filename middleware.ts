import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Si está en /auth, no protegemos
  if (pathname === '/auth') {
    return NextResponse.next()
  }

  // Para otras rutas, permitimos acceso por ahora
  // (auth será verificado en client-side con useAuth)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
