import { z } from "zod";

const nonEmpty = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const amountSchema = z.preprocess((v) => {
  if (typeof v === "string") return v.trim() === "" ? NaN : Number(v);
  return v;
}, z.number().finite().positive("amount must be greater than 0"));

const dateSchema = z.preprocess((v) => {
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return new Date("invalid");
    return new Date(s);
  }
  if (v instanceof Date) return v;
  return new Date("invalid");
}, z.date());

export const createVehicleRecordSchema = z.object({
  vehicleNumber: nonEmpty("vehicleNumber"),
  date: dateSchema,
  description: nonEmpty("description"),
  mechanicName: nonEmpty("mechanicName"),
  amount: amountSchema,
});

export const updateVehicleRecordSchema = createVehicleRecordSchema;

