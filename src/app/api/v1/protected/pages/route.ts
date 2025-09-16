/**
 * @swagger
 * tags:
 *   - name: Pages
 *     description: Manage pages
 *
 * /api/v1/protected/pages:
 *   get:
 *     summary: Get all pages
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all pages
 *
 *   post:
 *     summary: Create a new page
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 example: "homepage"
 *     responses:
 *       201:
 *         description: Page created successfully
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const pages = await prisma.page.findMany({
    include: { sections: { include: { contents: true } } },
  });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const { key } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const page = await prisma.page.create({
    data: { key },
  });

  return NextResponse.json(page, { status: 201 });
}
