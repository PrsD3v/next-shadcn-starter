import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/v1/protected/pages/{pageId}/sections:
 *   post:
 *     summary: Create a new section for a page
 *     description: Creates a new section under the specified page. Protected route, requires authentication.
 *     tags:
 *       - Pages
 *     parameters:
 *       - in: path
 *         name: pageId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the page to add the section to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: "hero"
 *             required:
 *               - key
 *     responses:
 *       200:
 *         description: Section created successfully
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
 *                   example: "ckv7d9abc456"
 *                 key:
 *                   type: string
 *                   example: "hero"
 *                 pageId:
 *                   type: integer
 *                   example: 1
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error (missing key)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Key is required"
 *       404:
 *         description: Page not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Page not found"
 */

export async function POST(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const { key } = await req.json();
  const { pageId } = params;

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const section = await prisma.section.create({
    data: {
      key,
      pageId: Number(pageId),
    },
  });

  return NextResponse.json(section);
}
