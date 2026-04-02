import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVehicleRecordSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createVehicleRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await prisma.vehicleRecord.create({
    data: {
      vehicleNumber: parsed.data.vehicleNumber,
      date: parsed.data.date,
      description: parsed.data.description,
      mechanicName: parsed.data.mechanicName,
      amount: parsed.data.amount,
      isEdited: false,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vehicle = searchParams.get("vehicle")?.trim();

  const records = await prisma.vehicleRecord.findMany({
    where: vehicle ? { vehicleNumber: { contains: vehicle, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(records);
}

