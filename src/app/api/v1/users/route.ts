import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({ include: { roles: true } });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { phone, password, roles } = await req.json();
  const user = await prisma.user.create({
    data: {
      phone,
      password,
      roles: { connect: roles.map((id: string) => ({ id })) },
    },
    include: { roles: true },
  });
  return NextResponse.json(user);
}
