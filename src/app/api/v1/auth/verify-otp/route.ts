/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verifies the OTP for the given identifier and creates/returns the user if needed.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "+989361106813"
 *               code:
 *                 type: string
 *                 example: "123456"
 *               method:
 *                 type: string
 *                 enum: ["sms", "wa", "email"]
 *             required:
 *               - identifier
 *               - code
 *               - method
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */

import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { identifier, code, method } = await req.json();

  if (!identifier || !code || !method) {
    return NextResponse.json(
      { success: false, message: "identifier, otp و method الزامی هستند" },
      { status: 400 }
    );
  }

  const redisKey = `otp:${identifier}`;
  const otpDataRaw = await redis.get(redisKey);

  if (!otpDataRaw) {
    return NextResponse.json(
      { success: false, message: "OTP منقضی شده یا وجود ندارد" },
      { status: 400 }
    );
  }

  const otpData = JSON.parse(otpDataRaw);

  const isValid = await bcrypt.compare(code, otpData.otpHash);
  if (!isValid) {
    return NextResponse.json(
      { success: false, message: "OTP نامعتبر است" },
      { status: 400 }
    );
  }

  await redis.del(redisKey);

  let user = null;
  if (method !== "email") {
    user = await prisma.user.findUnique({ where: { phoneNumber: identifier } });
  } else {
    user = await prisma.user.findUnique({ where: { email: identifier } });
  }

  if (!user) {
    user = await prisma.user.create({
      data:
        method !== "email"
          ? { phoneNumber: identifier }
          : { email: identifier },
    });
    return NextResponse.json({ publicId: user.publicId });
  }

  const accessToken = signAccessToken({
    userId: user.publicId,
  });
  const refreshToken = signRefreshToken({ userId: user.publicId });

  const res = NextResponse.json({ accessToken, refreshToken });
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/refresh",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
