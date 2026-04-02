import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateVehicleRecordSchema } from "@/lib/validation";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const recordId = Number(id);
  if (!Number.isInteger(recordId) || recordId <= 0) {
    return NextResponse.json({ error: "InvalidId" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateVehicleRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.vehicleRecord.findUnique({
    where: { id: recordId },
    select: { id: true, isEdited: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "NotFound" }, { status: 404 });
  }
  if (existing.isEdited) {
    return NextResponse.json(
      { error: "AlreadyEdited", message: "Record can only be edited once." },
      { status: 409 },
    );
  }

  const updated = await prisma.vehicleRecord.update({
    where: { id: recordId },
    data: {
      vehicleNumber: parsed.data.vehicleNumber,
      date: parsed.data.date,
      description: parsed.data.description,
      mechanicName: parsed.data.mechanicName,
      amount: parsed.data.amount,
      isEdited: true,
    },
  });

  return NextResponse.json(updated);
}

