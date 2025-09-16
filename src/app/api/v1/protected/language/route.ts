/**
 * @swagger
 * /api/v1/protected/languages:
 *   get:
 *     summary: Get all languages
 *     description: Returns all languages.
 *     tags:
 *       - Language
 *     responses:
 *       200:
 *         description: List of languages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Language'
 *   post:
 *     summary: Create a new language
 *     description: Adds a new language.
 *     tags:
 *       - Language
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LanguageInput'
 *     responses:
 *       201:
 *         description: Language created successfully
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const languages = await prisma.language.findMany();
  return NextResponse.json(languages);
}

export async function POST(req: NextRequest) {
  const { code, direction, fontClass } = await req.json();
  if (!code || !direction) {
    return NextResponse.json(
      { error: "code و direction الزامی هستند" },
      { status: 400 }
    );
  }

  const language = await prisma.language.create({
    data: { code, direction, fontClass },
  });

  return NextResponse.json(language, { status: 201 });
}
