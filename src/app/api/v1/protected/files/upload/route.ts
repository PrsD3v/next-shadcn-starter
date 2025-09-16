/**
 * @swagger
 * /api/v1/protected/files/upload:
 *   post:
 *     summary: Upload a new file
 *     description: Upload a file and store metadata in the database (JWT protected).
 *     tags:
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: "banners"
 *               category:
 *                 type: string
 *                 example: "hero-images"
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string | null;
  const category = formData.get("category") as string | null;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder || "");
  fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, file.name);
  fs.writeFileSync(filePath, buffer);

  const url = `/uploads/${folder ? folder + "/" : ""}${file.name}`;

  const saved = await prisma.file.create({
    data: {
      name: file.name,
      type: file.type,
      url,
      size: buffer.length,
      folder: folder || null,
      category: category || null,
    },
  });

  return NextResponse.json(saved);
}
