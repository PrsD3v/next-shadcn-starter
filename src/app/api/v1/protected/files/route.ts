/**
 * @swagger
 * /api/v1/protected/files:
 *   get:
 *     summary: List files
 *     description: Retrieve all files with optional folder/category filters (JWT protected).
 *     tags:
 *       - Files
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by folder
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of files
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get("folder") || undefined;
  const category = req.nextUrl.searchParams.get("category") || undefined;

  const files = await prisma.file.findMany({
    where: { folder, category },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(files);
}
