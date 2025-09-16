/**
 * @swagger
 * /api/v1/auth/send-otp:
 *   post:
 *     summary: Send OTP code
 *     description: Generates OTP, stores it hashed in Redis, prevents duplicate OTPs, and rate-limits requests.
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
 *               method:
 *                 type: string
 *                 enum: ["sms", "wa", "email"]
 *                 example: "sms"
 *               type:
 *                 type: string
 *                 enum: ["login", "register"]
 *                 example: "login"
 *             required:
 *               - identifier
 *               - method
 *               - type
 *     responses:
 *       200:
 *         description: OTP generated and sent
 *       400:
 *         description: Invalid input
 *       429:
 *         description: Too many requests (OTP already exists or rate limited)
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import redis from "@/lib/redis";
import { sendEmail } from "@/lib/email";

function generateOtp(length: number = 6) {
  return crypto
    .randomInt(0, 10 ** length)
    .toString()
    .padStart(length, "0");
}

async function sendOtpMessage(
  identifier: string,
  method: "sms" | "wa" | "email",
  otp: string
) {
  if (method === "email") {
    await sendEmail(identifier, "Your OTP Code", `Your OTP is: ${otp}`);
    console.log(`[OTP] Sent via Email to ${identifier}`);
  } else {
    console.log(`[OTP] Sending ${otp} via ${method} to ${identifier}`);
    // TODO: جایگزین با سرویس واقعی SMS/WhatsApp
  }
  return true;
}

export async function POST(req: NextRequest) {
  const { identifier, method, type } = await req.json();

  if (!identifier || !method || !type) {
    return NextResponse.json(
      { success: false, message: "identifier, method و type الزامی هستند" },
      { status: 400 }
    );
  }

  if (!["sms", "wa", "email"].includes(method)) {
    return NextResponse.json(
      { success: false, message: "method نامعتبر است" },
      { status: 400 }
    );
  }

  if (!["login", "register"].includes(type)) {
    return NextResponse.json(
      { success: false, message: "type نامعتبر است" },
      { status: 400 }
    );
  }

  const redisKey = `otp:${identifier}`;

  const existing = await redis.get(redisKey);
  if (existing) {
    return NextResponse.json(
      { success: false, message: "کد OTP فعال موجود است. صبر کنید." },
      { status: 429 }
    );
  }

  const rateKey = `otp-rate:${identifier}`;
  const rate = await redis.get(rateKey);
  if (rate) {
    return NextResponse.json(
      { success: false, message: "لطفا کمی صبر کنید و دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const otpObject = JSON.stringify({
    otpHash,
    method,
    createdAt: Date.now(),
  });

  await redis.set(redisKey, otpObject, "EX", 300);
  await redis.set(rateKey, "1", "EX", 60);

  await sendOtpMessage(identifier, method as "sms" | "wa" | "email", otp);

  return NextResponse.json({
    success: true,
    message: "کد OTP ارسال شد",
    ttl: 300,
    otp,
  });
}
