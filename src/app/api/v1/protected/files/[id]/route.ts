/**
 * @swagger
 * /api/v1/protected/files/{id}:
 *   get:
 *     summary: Get a single file
 *     description: Retrieve metadata of a single file by ID (JWT protected).
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: File publicId
 *     responses:
 *       200:
 *         description: File metadata
 *       404:
 *         description: File not found
 *   delete:
 *     summary: Delete a file
 *     description: Delete file from database and disk (JWT protected).
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: File publicId
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const file = await prisma.file.findUnique({
    where: { publicId: params.id },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json(file);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const file = await prisma.file.findUnique({ where: { publicId: params.id } });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), "public", file.url);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }

  await prisma.file.delete({ where: { publicId: params.id } });

  return NextResponse.json({ success: true, message: "File deleted" });
}
