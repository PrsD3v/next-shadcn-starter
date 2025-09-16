/**
 * @swagger
 * tags:
 *   - name: Folders
 *     description: Manage folders
 */

/**
 * @swagger
 * /api/v1/protected/folders:
 *   get:
 *     summary: Get all folders
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of folders
 *   post:
 *     summary: Create a new folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       201:
 *         description: Folder created
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const folders = await prisma.folder.findMany({
    include: { children: true, files: true },
  });
  return NextResponse.json(folders);
}

export async function POST(req: NextRequest) {
  const { name, parentId } = await req.json();
  if (!name)
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  const folder = await prisma.folder.create({
    data: { name, parentId: parentId ? Number(parentId) : null },
  });
  return NextResponse.json(folder, { status: 201 });
}
