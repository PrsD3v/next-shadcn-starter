/**
 * @swagger
 * /api/v1/protected/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags:
 *       - Permissions
 *     responses:
 *       200:
 *         description: List of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 *
 *   post:
 *     summary: Create a new permission
 *     tags:
 *       - Permissions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resource:
 *                 type: string
 *                 example: "articles"
 *               action:
 *                 type: string
 *                 example: "create"
 *             required:
 *               - resource
 *               - action
 *     responses:
 *       201:
 *         description: Permission created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *
 * /api/v1/protected/permissions/{publicId}:
 *   put:
 *     summary: Update a permission
 *     tags:
 *       - Permissions
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resource:
 *                 type: string
 *               action:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *
 *   delete:
 *     summary: Delete a permission
 *     tags:
 *       - Permissions
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Permission deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         publicId:
 *           type: string
 *         resource:
 *           type: string
 *         action:
 *           type: string
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         publicId:
 *           type: string
 *         name:
 *           type: string
 *         key:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               permissionId:
 *                 type: integer
 *               permission:
 *                 $ref: '#/components/schemas/Permission'
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/v1/protected/permissions
 */
export async function GET(req: NextRequest) {
  const permissions = await prisma.permission.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(permissions);
}

/**
 * POST /api/v1/protected/permissions
 */
export async function POST(req: NextRequest) {
  const { resource, action } = await req.json();
  if (!resource || !action)
    return NextResponse.json(
      { error: "Resource and action required" },
      { status: 400 }
    );

  const existing = await prisma.permission.findFirst({
    where: { resource, action },
  });
  if (existing)
    return NextResponse.json(
      { error: "Permission already exists" },
      { status: 400 }
    );

  const permission = await prisma.permission.create({
    data: { resource, action },
  });
  return NextResponse.json(permission, { status: 201 });
}

/**
 * PUT /api/v1/protected/permissions/{publicId}
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const { resource, action } = await req.json();
  const permission = await prisma.permission.update({
    where: { publicId: params.publicId },
    data: { resource, action },
  });
  return NextResponse.json(permission);
}

/**
 * DELETE /api/v1/protected/permissions/{publicId}
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  await prisma.permission.delete({ where: { publicId: params.publicId } });
  return NextResponse.json({ success: true, message: "Permission deleted" });
}
