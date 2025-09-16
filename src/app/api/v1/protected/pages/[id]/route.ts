/**
 * @swagger
 * /api/v1/protected/pages/{id}:
 *   get:
 *     summary: Get page by ID
 *     tags: [Pages]
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
 *         description: Page retrieved successfully
 *       404:
 *         description: Page not found
 *
 *   put:
 *     summary: Update page key
 *     tags: [Pages]
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
 *                 example: "about"
 *     responses:
 *       200:
 *         description: Page updated successfully
 *       404:
 *         description: Page not found
 *
 *   delete:
 *     summary: Delete page
 *     tags: [Pages]
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
 *         description: Page deleted successfully
 *       404:
 *         description: Page not found
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const page = await prisma.page.findUnique({
    where: { id: Number(params.id) },
    include: { sections: { include: { contents: true } } },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { key } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const page = await prisma.page
    .update({
      where: { id: Number(params.id) },
      data: { key },
    })
    .catch(() => null);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const page = await prisma.page
    .delete({
      where: { id: Number(params.id) },
    })
    .catch(() => null);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
