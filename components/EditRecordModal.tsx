"use client";

import { useEffect, useState } from "react";
import type { VehicleRecord } from "@/components/DashboardClient";

type Props = {
  record: VehicleRecord | null;
  onClose: () => void;
  onSaved: () => void;
};

export function EditRecordModal({ record, onClose, onSaved }: Props) {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [mechanicName, setMechanicName] = useState("");
  const [amount, setAmount] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!record) return;
    setVehicleNumber(record.vehicleNumber);
    setDate(record.date.slice(0, 10));
    setDescription(record.description);
    setMechanicName(record.mechanicName);
    setAmount(String(record.amount));
    setError(null);
    setSubmitting(false);
  }, [record]);

  if (!record) return null;

  async function save() {
    const recordId = record?.id;
    if (!recordId) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/records/${recordId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vehicleNumber,
          date,
          description,
          mechanicName,
          amount,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string; message?: string }
          | null;
        const msg =
          payload?.message ??
          payload?.error ??
          `Failed to update record (${res.status})`;
        throw new Error(msg);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update record");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
        <div className="flex items-start justify-between border-b bg-gradient-to-r from-amber-50 to-white px-5 py-4">
          <div>
            <h3 className="text-base font-semibold">Edit record</h3>
          </div>
          <button
            type="button"
            className="rounded-xl px-2 py-1 text-sm font-semibold text-zinc-800 hover:bg-white/60"
            onClick={onClose}
            disabled={submitting}
          >
            Close
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Vehicle number
              <input
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/50"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-zinc-700">
              Date
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/50"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-zinc-700">
            Description
            <textarea
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Mechanic name
              <input
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/50"
                value={mechanicName}
                onChange={(e) => setMechanicName(e.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-zinc-700">
              Amount
              <input
                inputMode="decimal"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-zinc-50 px-5 py-4">
          <button
            type="button"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
            onClick={() => void save()}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save (final)"}
          </button>
        </div>
      </div>
    </div>
  );
}

