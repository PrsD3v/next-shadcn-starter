/**
 * @swagger
 * /api/v1/protected/roles:
 *   get:
 *     summary: Get all roles
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   publicId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   key:
 *                     type: string
 *                   permissions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         permissionId:
 *                           type: integer
 *                         permission:
 *                           $ref: '#/components/schemas/Permission'
 *
 *   post:
 *     summary: Create a new role
 *     tags:
 *       - Roles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               key:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Role created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *
 * /api/v1/protected/roles/{publicId}:
 *   get:
 *     summary: Get role by publicId
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Role found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *
 *   put:
 *     summary: Update a role
 *     tags:
 *       - Roles
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
 *               name:
 *                 type: string
 *               key:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Role updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *
 *   delete:
 *     summary: Delete a role
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Role deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/v1/protected/roles
 */
export async function GET(req: NextRequest) {
  const roles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } } },
  });
  return NextResponse.json({ roles });
}

/**
 * GET /api/v1/protected/roles/{publicId}
 */
export async function GET_BY_ID(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const role = await prisma.role.findUnique({
    where: { publicId: params.publicId },
    include: { permissions: { include: { permission: true } } },
  });
  if (!role)
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  return NextResponse.json({ role });
}

/**
 * POST /api/v1/protected/roles
 */
export async function POST(req: NextRequest) {
  const { name, key, permissionIds } = await req.json();
  if (!name || !key)
    return NextResponse.json(
      { error: "name and key are required" },
      { status: 400 }
    );

  const role = await prisma.role.create({
    data: {
      name,
      key,
      permissions: permissionIds?.length
        ? { create: permissionIds.map((id: number) => ({ permissionId: id })) }
        : undefined,
    },
    include: { permissions: { include: { permission: true } } },
  });
  return NextResponse.json({ role }, { status: 201 });
}

/**
 * PUT /api/v1/protected/roles/{publicId}
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const { name, key, permissionIds } = await req.json();
  const role = await prisma.role.update({
    where: { publicId: params.publicId },
    data: {
      name,
      key,
      permissions: {
        deleteMany: {},
        create: permissionIds?.length
          ? permissionIds.map((id: number) => ({ permissionId: id }))
          : [],
      },
    },
    include: { permissions: { include: { permission: true } } },
  });
  return NextResponse.json({ role });
}

/**
 * DELETE /api/v1/protected/roles/{publicId}
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  await prisma.role.delete({ where: { publicId: params.publicId } });
  return NextResponse.json({ success: true, message: "Role deleted" });
}
