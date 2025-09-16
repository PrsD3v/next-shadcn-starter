/**
 * @swagger
 * /api/v1/public/pages:
 *   get:
 *     summary: Get all pages with sections and contents
 *     description: Returns all pages along with their sections and each section's contents.
 *     tags:
 *       - Pages
 *     responses:
 *       200:
 *         description: List of pages with sections and contents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   publicId:
 *                     type: string
 *                     example: "ckv6s7abc123"
 *                   key:
 *                     type: string
 *                     example: "homepage"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   sections:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         publicId:
 *                           type: string
 *                           example: "ckv6s7sec456"
 *                         key:
 *                           type: string
 *                           example: "hero"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                         contents:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               publicId:
 *                                 type: string
 *                                 example: "ckv6s7con789"
 *                               type:
 *                                 type: string
 *                                 example: "text"
 *                               language:
 *                                 type: string
 *                                 example: "en"
 *                               value:
 *                                 type: string
 *                                 example: "Welcome to our platform"
 *                               key:
 *                                 type: string
 *                                 example: "title"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 */
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const pages = await prisma.page.findMany({
    include: {
      sections: {
        include: { contents: true },
      },
    },
  });
  return NextResponse.json(pages);
}
