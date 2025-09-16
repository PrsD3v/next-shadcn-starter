/**
 * @swagger
 * /api/v1/auth/user-existence:
 *   post:
 *     summary: Check if a user exists
 *     description: Checks if the user exists in the database and returns available verification options.
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
 *               type:
 *                 type: string
 *                 enum: ["login", "register"]
 *                 example: "login"
 *               method:
 *                 type: string
 *                 enum: ["phone", "email", "username"]
 *             required:
 *               - identifier
 *               - type
 *               - method
 *     responses:
 *       200:
 *         description: User existence status
 *       422:
 *         description: Validation error
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { identifier, type, method } = await req.json();

  if (!identifier || !type || !method) {
    return NextResponse.json(
      { success: false, message: "identifier, type و method الزامی هستند" },
      { status: 400 }
    );
  }

  if (!["login", "register"].includes(type)) {
    return NextResponse.json(
      { success: false, message: "type باید login یا register باشد" },
      { status: 400 }
    );
  }

  if (!["phone", "email", "username"].includes(method)) {
    return NextResponse.json(
      { success: false, message: "method نامعتبر است" },
      { status: 400 }
    );
  }

  let user = null;

  if (method === "phone") {
    user = await prisma.user.findUnique({ where: { phoneNumber: identifier } });
  } else if (method === "email") {
    user = await prisma.user.findUnique({ where: { email: identifier } });
  } else if (method === "username") {
    user = await prisma.user.findUnique({ where: { username: identifier } });
  }

  const userExists = !!user;

  if (type === "login" && !userExists) {
    return NextResponse.json(
      { success: false, message: "کاربری با این مشخصات یافت نشد" },
      { status: 422 }
    );
  }

  if (type === "register" && userExists) {
    return NextResponse.json(
      { success: false, message: "کاربر با این مشخصات قبلاً ثبت‌نام کرده است" },
      { status: 422 }
    );
  }

  return NextResponse.json({
    success: true,
    userExists,
    activated: userExists ? !!user?.isVerified : false,
    recaptcha: false,
    verifyOptions: {
      phone: !!user?.phoneNumber,
      email: !!user?.email,
      password: !!user?.password,
    },
  });
}
