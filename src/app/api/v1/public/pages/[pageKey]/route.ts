/**
 * @swagger
 * /api/v1/public/pages/{pageKey}:
 *   get:
 *     summary: Get page content by key
 *     description: Retrieves a page with its sections and contents filtered by language. Public route.
 *     tags:
 *       - Pages
 *     parameters:
 *       - in: path
 *         name: pageKey
 *         schema:
 *           type: string
 *         required: true
 *         description: The key of the page (e.g., "homepage", "about")
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           example: "en"
 *         required: false
 *         description: Language code to filter contents (default: "fa")
 *     responses:
 *       200:
 *         description: Page retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 publicId:
 *                   type: string
 *                   example: "ckv8d1abc789"
 *                 key:
 *                   type: string
 *                   example: "homepage"
 *                 sections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       publicId:
 *                         type: string
 *                         example: "ckv8d1sec123"
 *                       key:
 *                         type: string
 *                         example: "hero"
 *                       contents:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             publicId:
 *                               type: string
 *                               example: "ckv8d1cont456"
 *                             type:
 *                               type: string
 *                               example: "text"
 *                             language:
 *                               type: string
 *                               example: "en"
 *                             key:
 *                               type: string
 *                               example: "title"
 *                             value:
 *                               type: string
 *                               example: "Welcome to our platform"
 *                             sectionId:
 *                               type: integer
 *                               example: 1
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Page not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Page not found"
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { pageKey: string } }
) {
  const lang = req.nextUrl.searchParams.get("lang") || "fa";

  const page = await prisma.page.findUnique({
    where: { key: params.pageKey },
    include: {
      sections: {
        include: {
          contents: {
            where: { language: lang },
          },
        },
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}
