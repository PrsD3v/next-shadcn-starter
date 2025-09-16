/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: |
 *       Handles the callback from Google after user consents.
 *       Exchanges the authorization code for tokens, fetches user profile,
 *       creates the user if they don’t exist, and returns JWT tokens.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google OAuth redirect
 *     responses:
 *       200:
 *         description: OAuth successful, tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing or invalid code / email not returned from Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No code provided"
 */
import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const userinfo = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  ).then((res) => res.json());

  if (!userinfo.email) {
    return NextResponse.json(
      { error: "No email from Google" },
      { status: 400 }
    );
  }

  let user = await prisma.user.findUnique({ where: { email: userinfo.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userinfo.email,
        username: userinfo.name,
        profile: {
          create: {
            fullName: userinfo.name,
            avatarUrl: userinfo.picture,
          },
        },
        isVerified: true,
      },
    });
  }

  const accessToken = signAccessToken({ userId: user.publicId });
  const refreshToken = signRefreshToken({ userId: user.publicId });

  const res = NextResponse.json({ accessToken, refreshToken });
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth/refresh",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
