/**
 * @swagger
 * /api/v1/protected/languages/{id}:
 *   get:
 *     summary: Get a language by ID
 *     tags:
 *       - Language
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Language ID
 *     responses:
 *       200:
 *         description: Language found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Language'
 *       404:
 *         description: Language not found
 *   patch:
 *     summary: Update a language by ID
 *     tags:
 *       - Language
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LanguageInput'
 *     responses:
 *       200:
 *         description: Language updated
 *   delete:
 *     summary: Delete a language by ID
 *     tags:
 *       - Language
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Language deleted
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const language = await prisma.language.findUnique({
    where: { id: Number(params.id) },
  });

  if (!language)
    return NextResponse.json({ error: "Language not found" }, { status: 404 });

  return NextResponse.json(language);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const language = await prisma.language.update({
    where: { id: Number(params.id) },
    data,
  });
  return NextResponse.json(language);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.language.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({}, { status: 204 });
}
