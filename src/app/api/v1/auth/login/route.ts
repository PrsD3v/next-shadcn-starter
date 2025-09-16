/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with identity (phone, email, username) and optional password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identity:
 *                 type: string
 *                 example: "09121234567"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful or first-time user requires username setup
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     needUsername:
 *                       type: boolean
 *                       example: true
 *                     publicId:
 *                       type: string
 *                 - type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { identity, password } = await req.json();
  if (!identity)
    return NextResponse.json({ error: "Identity required" }, { status: 400 });

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ phone: identity }, { email: identity }, { username: identity }],
    },
    include: { roles: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { phone: identity },
      include: { roles: true },
    });
    return NextResponse.json({ needUsername: true, publicId: user.publicId });
  }

  if (user.password && password !== user.password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const accessToken = signAccessToken({
    userId: user.publicId,
    roles: user.roles.map((r) => r.name),
  });
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
