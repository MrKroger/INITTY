import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id");
  const { nextUrl } = request;
  
  const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  if (!sessionId && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionId && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export{
  middleware,
}