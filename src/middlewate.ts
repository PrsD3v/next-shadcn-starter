import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./lib/jwt";

const PUBLIC_PATHS = [
  "/api/public",
  "/api/auth/login",
  "/api/auth/send-otp",
  "/api/auth/refresh",
  "/fa/login",
  "/fa/register",
];

const SUPPORTED_LOCALES = ["fa", "en"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const segments = pathname.split("/").filter(Boolean);
  const hasLocale =
    segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0]);

  if (!hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/fa${pathname}`;
    return NextResponse.redirect(url);
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.redirect(new URL("/fa/login", req.url));
  }

  try {
    verifyAccessToken(token);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/fa/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
