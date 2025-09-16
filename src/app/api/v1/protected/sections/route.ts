/**
 * @swagger
 * tags:
 *   - name: Sections
 *     description: Manage sections of pages
 *
 * /api/v1/protected/sections:
 *   get:
 *     summary: Get all sections
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all sections
 *   post:
 *     summary: Create a new section
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pageId
 *               - key
 *             properties:
 *               pageId:
 *                 type: integer
 *                 example: 1
 *               key:
 *                 type: string
 *                 example: "hero"
 *     responses:
 *       201:
 *         description: Section created successfully
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const sections = await prisma.section.findMany({
    include: { contents: true },
  });
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  const { pageId, key } = await req.json();

  if (!pageId || !key) {
    return NextResponse.json(
      { error: "pageId and key are required" },
      { status: 400 }
    );
  }

  const section = await prisma.section.create({
    data: { pageId, key },
  });

  return NextResponse.json(section, { status: 201 });
}
