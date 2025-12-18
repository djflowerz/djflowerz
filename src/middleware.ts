import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check for Netlify Identity JWT token in cookies
  const token = request.cookies.get('nf_jwt')?.value

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }

    // Decode JWT to check user email (basic validation)
    // In production, you should verify the JWT signature
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))

      // Strict Admin Email Check
      if (payload.email !== 'ianmuriithiflowerz@gmail.com') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
};
