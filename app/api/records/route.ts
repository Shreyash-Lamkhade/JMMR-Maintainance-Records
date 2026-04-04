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

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vehicle = searchParams.get("vehicle")?.trim();

  if (!vehicle) {
    return NextResponse.json(
      { error: "MissingVehicle", message: "vehicle query parameter is required" },
      { status: 400 },
    );
  }

  const result = await prisma.vehicleRecord.deleteMany({
    where: { vehicleNumber: { equals: vehicle, mode: "insensitive" } },
  });

  return NextResponse.json({
    message: `Deleted ${result.count} record(s) for vehicle ${vehicle}`,
    count: result.count,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vehicle = searchParams.get("vehicle")?.trim();
  const exact = searchParams.get("exact") === "1";

  const records = await prisma.vehicleRecord.findMany({
    where: vehicle
      ? exact
        ? { vehicleNumber: { equals: vehicle, mode: "insensitive" } }
        : { vehicleNumber: { contains: vehicle, mode: "insensitive" } }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(records);
}

