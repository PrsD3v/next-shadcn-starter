/**
 * @swagger
 * /api/v1/protected/folders/{id}:
 *   get:
 *     summary: Get folder by ID
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *   patch:
 *     summary: Update folder (rename / move)
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parentId:
 *                 type: integer
 *                 nullable: true
 *   delete:
 *     summary: Delete folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const folder = await prisma.folder.findUnique({
    where: { id: Number(params.id) },
    include: { children: true, files: true },
  });
  if (!folder)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(folder);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { name, parentId } = await req.json();
  const folder = await prisma.folder.update({
    where: { id: Number(params.id) },
    data: { name, parentId: parentId ?? null },
  });
  return NextResponse.json(folder);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.folder.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ message: "Folder deleted" });
}
