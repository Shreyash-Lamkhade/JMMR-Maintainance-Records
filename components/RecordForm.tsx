"use client";

import { useState } from "react";

type Props = {
  onCreated: () => void;
};

export function RecordForm({ onCreated }: Props) {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [mechanicName, setMechanicName] = useState("");
  const [amount, setAmount] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
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
          | { error?: string; message?: string; details?: unknown }
          | null;
        const msg =
          payload?.message ??
          payload?.error ??
          `Failed to create record (${res.status})`;
        throw new Error(msg);
      }

      setVehicleNumber("");
      setDate("");
      setDescription("");
      setMechanicName("");
      setAmount("");
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create record");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700">
          Vehicle number
          <input
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-emerald-300 focus:ring-4 focus:ring-emerald-200/50"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="ABC-123"
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Date
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-emerald-300 focus:ring-4 focus:ring-emerald-200/50"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-zinc-700">
        Description
        <textarea
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-emerald-300 focus:ring-4 focus:ring-emerald-200/50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Oil change, brake pads, etc."
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700">
          Mechanic name
          <input
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-emerald-300 focus:ring-4 focus:ring-emerald-200/50"
            value={mechanicName}
            onChange={(e) => setMechanicName(e.target.value)}
            placeholder="John Doe"
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Amount
          <input
            inputMode="decimal"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-emerald-300 focus:ring-4 focus:ring-emerald-200/50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
      </div>

      <div className="pt-1">
        <button
          type="button"
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60"
          onClick={() => void submit()}
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Add record"}
        </button>
      </div>
    </div>
  );
}

