/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Redirect to Google OAuth
 *     description: |
 *       Starts the Google OAuth2 login flow by redirecting the user
 *       to Google's consent screen.
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirect to Google login page
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
