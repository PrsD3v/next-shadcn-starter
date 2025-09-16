/**
 * @swagger
 * /api/v1/protected/settings/change-password:
 *   post:
 *     summary: Set or change user password (Protected)
 *     description:
 *       - First-time users: just provide a new password (Set Password).
 *       - Returning users: provide old password and new password (Change Password).
 *       - JWT auth required.
 *     tags:
 *       - Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "oldpassword123"
 *                 description: Required only if user has already set a password
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *             required:
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       400:
 *         description: Validation error
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { newPassword, oldPassword } = await req.json();
  if (!newPassword) {
    return NextResponse.json(
      { success: false, message: "newPassword الزامی است" },
      { status: 400 }
    );
  }

  const publicId = payload.userId;
  const user = await prisma.user.findUnique({ where: { publicId } });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "کاربر یافت نشد" },
      { status: 404 }
    );
  }

  if (user.password) {
    if (!oldPassword) {
      return NextResponse.json(
        { success: false, message: "رمز فعلی الزامی است" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "رمز فعلی اشتباه است" },
        { status: 400 }
      );
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { publicId },
    data: { password: hashedPassword, isVerified: true },
  });

  return NextResponse.json({
    success: true,
    message: user.password
      ? "Password changed successfully"
      : "Password set successfully",
  });
}
