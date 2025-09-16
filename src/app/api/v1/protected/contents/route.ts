/**
 * @swagger
 * tags:
 *   - name: Contents
 *     description: Manage contents of sections
 *
 * /api/v1/protected/contents:
 *   get:
 *     summary: Get all contents
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all contents
 *   post:
 *     summary: Create a new content
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sectionId
 *               - type
 *               - language
 *               - key
 *               - value
 *             properties:
 *               sectionId:
 *                 type: integer
 *                 example: 1
 *               type:
 *                 type: string
 *                 example: "text"
 *               language:
 *                 type: string
 *                 example: "en"
 *               key:
 *                 type: string
 *                 example: "title"
 *               value:
 *                 type: string
 *                 example: "Welcome to our platform"
 *     responses:
 *       201:
 *         description: Content created successfully
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const contents = await prisma.content.findMany();
  return NextResponse.json(contents);
}

export async function POST(req: NextRequest) {
  const { sectionId, type, language, key, value } = await req.json();

  if (!sectionId || !type || !language || !key || !value) {
    return NextResponse.json(
      { error: "sectionId, type, language, key, value required" },
      { status: 400 }
    );
  }

  const content = await prisma.content.create({
    data: { sectionId, type, language, key, value },
  });

  return NextResponse.json(content, { status: 201 });
}
