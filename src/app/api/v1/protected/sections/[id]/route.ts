/**
 * @swagger
 * /api/v1/protected/sections/{id}:
 *   get:
 *     summary: Get section by ID
 *     tags: [Sections]
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
 *         description: Section retrieved successfully
 *       404:
 *         description: Section not found
 *   put:
 *     summary: Update section
 *     tags: [Sections]
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
 *               key:
 *                 type: string
 *                 example: "gallery"
 *     responses:
 *       200:
 *         description: Section updated successfully
 *       404:
 *         description: Section not found
 *   delete:
 *     summary: Delete section
 *     tags: [Sections]
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
 *         description: Section deleted successfully
 *       404:
 *         description: Section not found
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const section = await prisma.section.findUnique({
    where: { id: Number(params.id) },
    include: { contents: true },
  });

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  return NextResponse.json(section);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { key } = await req.json();

  const section = await prisma.section
    .update({
      where: { id: Number(params.id) },
      data: { key },
    })
    .catch(() => null);

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  return NextResponse.json(section);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const section = await prisma.section
    .delete({
      where: { id: Number(params.id) },
    })
    .catch(() => null);

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
