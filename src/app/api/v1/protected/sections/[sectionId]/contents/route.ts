/**
 * @swagger
 * /api/v1/protected/sections/{sectionId}/contents:
 *   post:
 *     summary: Create a new content for a section
 *     description: Creates a new content item (text, image, or file) under the specified section. Protected route, requires authentication.
 *     tags:
 *       - Sections
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the section to add the content to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [text, image, file]
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
 *             required:
 *               - type
 *               - language
 *               - key
 *               - value
 *     responses:
 *       200:
 *         description: Content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 publicId:
 *                   type: string
 *                   example: "ckv8d1abc789"
 *                 type:
 *                   type: string
 *                   example: "text"
 *                 language:
 *                   type: string
 *                   example: "en"
 *                 key:
 *                   type: string
 *                   example: "title"
 *                 value:
 *                   type: string
 *                   example: "Welcome to our platform"
 *                 sectionId:
 *                   type: integer
 *                   example: 1
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error (missing required fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "type, language, key, value required"
 *       404:
 *         description: Section not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Section not found"
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { sectionId: string } }
) {
  const { type, language, key, value } = await req.json();
  const { sectionId } = params;

  if (!type || !language || !key || !value) {
    return NextResponse.json(
      { error: "type, language, key, value required" },
      { status: 400 }
    );
  }

  const content = await prisma.content.create({
    data: {
      type,
      language,
      key,
      value,
      sectionId: Number(sectionId),
    },
  });

  return NextResponse.json(content);
}
