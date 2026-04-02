import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vehicle = searchParams.get("vehicle")?.trim();

  const rows = await prisma.vehicleRecord.findMany({
    select: { vehicleNumber: true },
    distinct: ["vehicleNumber"],
    where: vehicle
      ? { vehicleNumber: { contains: vehicle, mode: "insensitive" } }
      : undefined,
    orderBy: { vehicleNumber: "asc" },
  });

  return NextResponse.json(rows.map((r) => r.vehicleNumber));
}

