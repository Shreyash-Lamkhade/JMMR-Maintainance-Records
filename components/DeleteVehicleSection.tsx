"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  onDeleted: () => void;
};

export function DeleteVehicleSection({ onDeleted }: Props) {
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadVehicles() {
    try {
      const q = search.trim();
      const url = q
        ? `/api/records/vehicles?vehicle=${encodeURIComponent(q)}`
        : "/api/records/vehicles";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as string[];
      setVehicles(data);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function deleteVehicle(vehicleNumber: string) {
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `/api/records?vehicle=${encodeURIComponent(vehicleNumber)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(`Failed to delete (${res.status})`);
      const data = (await res.json()) as { count: number };
      setSuccess(
        `Deleted ${vehicleNumber} and ${data.count} record(s) successfully.`,
      );
      setSelected(null);
      setConfirmDelete(null);
      await loadVehicles();
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete vehicle");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <label className="block text-sm font-medium text-zinc-700">
        Search vehicle to delete
        <input
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-red-300 focus:ring-4 focus:ring-red-200/50"
          placeholder="Type vehicle number..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSuccess(null);
          }}
        />
      </label>

      <div className="max-h-[300px] space-y-2 overflow-auto pr-1">
        {vehicles.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-zinc-50 px-3 py-3 text-sm text-zinc-600">
            No vehicles found.
          </div>
        ) : (
          vehicles.map((v) => {
            const isSelected = selected?.toLowerCase() === v.toLowerCase();
            return (
              <button
                key={v}
                type="button"
                className={[
                  "flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition-colors",
                  isSelected
                    ? "border-red-300 bg-red-50 text-red-900 ring-1 ring-red-200"
                    : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
                ].join(" ")}
                onClick={() => {
                  setSelected(isSelected ? null : v);
                  setConfirmDelete(null);
                  setError(null);
                  setSuccess(null);
                }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white shadow-sm">
                  <Image src="/vehicle.svg" alt="" width={22} height={22} />
                </span>
                <span className="flex-1 truncate">{v}</span>
                {isSelected ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {selected ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
          {confirmDelete ? (
            <div className="space-y-3">
              <div className="text-sm text-zinc-700">
                This will permanently delete{" "}
                <strong className="text-zinc-900">{selected}</strong> and{" "}
                <strong className="text-zinc-900">
                  all its maintenance records
                </strong>
                . This action cannot be undone.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-60"
                  onClick={() => void deleteVehicle(selected)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, delete permanently"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              onClick={() => setConfirmDelete(selected)}
            >
              Delete {selected} and all its records
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
