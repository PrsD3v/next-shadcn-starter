/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     description: |
 *       Generates a new access token if a valid refresh token is present in cookies.
 *       Does not require user role check.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Refresh token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid refresh token"
 */
import { signAccessToken, verifyRefreshToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value;
  if (!token)
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  const payload = verifyRefreshToken(token);
  if (!payload)
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );

  const user = await prisma.user.findUnique({
    where: { publicId: payload.userId },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const accessToken = signAccessToken({
    userId: user.publicId,
  });

  return NextResponse.json({ accessToken });
}
