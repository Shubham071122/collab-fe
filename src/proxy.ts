import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "auth_token";
const AUTH_ROUTES = ["/login", "/signup"];
const PROTECTED_PREFIXES = ["/dashboard", "/project"];

function getPayload(token: string) {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const decodedJson = atob(payloadBase64);
    return JSON.parse(decodedJson);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: any) {
  if (!payload) return true;
  const exp = payload.exp;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? getPayload(token) : null;
  const isValid = payload && !isTokenExpired(payload);
  const isVerified = isValid && payload.is_verified === true;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isVerifyEmailRoute = pathname === "/verify-email";
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // 1. Logged Out Redirects
  if (!isValid) {
    if (isProtectedRoute || isVerifyEmailRoute) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      if (token) response.cookies.delete(COOKIE_NAME);
      return response;
    }
    return NextResponse.next();
  }

  // 2. Unverified User Redirects (The Cage)
  // If user is logged in but NOT verified, they ONLY belong on the verify-email page.
  if (!isVerified) {
    if (!isVerifyEmailRoute) {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }
    return NextResponse.next();
  }

  // 3. Verified User Redirects
  // If they are verified, they should NEVER be on the verify-email page.
  if (isVerifyEmailRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Already Logged In Redirects
  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ],
};
