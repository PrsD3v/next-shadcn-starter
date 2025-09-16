/**
 * @swagger
 * /api/v1/protected/contents/{id}:
 *   get:
 *     summary: Get content by ID
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *       404:
 *         description: Content not found
 *   put:
 *     summary: Update content
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "text"
 *               language:
 *                 type: string
 *                 example: "fa"
 *               key:
 *                 type: string
 *                 example: "subtitle"
 *               value:
 *                 type: string
 *                 example: "به پلتفرم ما خوش آمدید"
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       404:
 *         description: Content not found
 *   delete:
 *     summary: Delete content
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Content deleted successfully
 *       404:
 *         description: Content not found
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const content = await prisma.content.findUnique({
    where: { id: Number(params.id) },
  });

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  return NextResponse.json(content);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { type, language, key, value } = await req.json();

  const content = await prisma.content
    .update({
      where: { id: Number(params.id) },
      data: { type, language, key, value },
    })
    .catch(() => null);

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  return NextResponse.json(content);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const content = await prisma.content
    .delete({
      where: { id: Number(params.id) },
    })
    .catch(() => null);

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
