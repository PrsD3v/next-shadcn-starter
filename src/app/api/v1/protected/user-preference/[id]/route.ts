/**
 * @swagger
 * /api/v1/protected/user-preference/{id}:
 *   get:
 *     summary: Get a single user preference
 *     description: Retrieve a single user preference by ID.
 *     tags:
 *       - UserPreference
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Preference ID
 *     responses:
 *       200:
 *         description: User preference found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreference'
 *       404:
 *         description: Preference not found
 *   patch:
 *     summary: Update a single user preference
 *     description: Update a specific preference by ID.
 *     tags:
 *       - UserPreference
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
 *             $ref: '#/components/schemas/UserPreferenceInput'
 *     responses:
 *       200:
 *         description: Preference updated successfully
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const preference = await prisma.userPreference.findUnique({
    where: { id: Number(params.id) },
  });

  if (!preference)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(preference);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const updated = await prisma.userPreference.update({
    where: { id: Number(params.id) },
    data,
  });

  return NextResponse.json(updated);
}
