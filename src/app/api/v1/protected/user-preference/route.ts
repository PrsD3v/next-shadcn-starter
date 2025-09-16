/**
 * @swagger
 * /api/v1/protected/user-preference:
 *   get:
 *     summary: Get all user preferences
 *     description: Returns all preferences for the authenticated user.
 *     tags:
 *       - UserPreference
 *     responses:
 *       200:
 *         description: List of user preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserPreference'
 *   post:
 *     summary: Create or update user preferences
 *     description: Create new preferences or update existing ones for the authenticated user.
 *     tags:
 *       - UserPreference
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferenceInput'
 *     responses:
 *       200:
 *         description: Preferences saved successfully
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = { id: 0 };
  const preferences = await prisma.userPreference.findMany({
    where: { userId: user.id },
  });
  return NextResponse.json(preferences);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const user = { id: 0 };

  const preference = await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: { ...data },
    create: { userId: user.id, ...data },
  });

  return NextResponse.json(preference);
}
