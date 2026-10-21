// CSP com nonce por resposta: so roda script que o proprio Next emitiu.
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const dev = process.env.NODE_ENV !== 'production';
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src 'self'${dev ? ' ws:' : ''}`,
    `media-src 'self' blob:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join('; ');
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [{ source: '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)' }],
};
