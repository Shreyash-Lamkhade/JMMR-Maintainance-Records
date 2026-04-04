"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { VehicleRecord } from "@/components/DashboardClient";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onPickVehicle?: (vehicleNumber: string) => void;
  refreshKey?: number;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}

function formatAmount(a: number) {
  if (typeof a !== "number" || !Number.isFinite(a)) return String(a);
  return a.toFixed(2);
}

export function VehicleDropdownList({
  search,
  onSearchChange,
  onPickVehicle,
  refreshKey,
}: Props) {
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [openVehicle, setOpenVehicle] = useState<string | null>(null);
  const [vehicleRecords, setVehicleRecords] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehiclesUrl = useMemo(() => {
    const q = search.trim();
    return q
      ? `/api/records/vehicles?vehicle=${encodeURIComponent(q)}`
      : "/api/records/vehicles";
  }, [search]);

  async function loadVehicles() {
    try {
      const res = await fetch(vehiclesUrl, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as string[];
      setVehicles(data);
    } catch {
      // ignore
    }
  }

  async function loadVehicleHistory(vehicleNumber: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/records?vehicle=${encodeURIComponent(vehicleNumber)}&exact=1`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
      const data = (await res.json()) as VehicleRecord[];
      setVehicleRecords(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
      setVehicleRecords([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiclesUrl, refreshKey]);

  const openTotal = useMemo(() => {
    return vehicleRecords.reduce(
      (sum, r) => sum + (Number.isFinite(r.amount) ? r.amount : 0),
      0,
    );
  }, [vehicleRecords]);

  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Vehicles</h2>
          <div className="mt-1 text-xs text-zinc-500">
            Click a vehicle to open its past records
          </div>
        </div>
        <button
          type="button"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
          onClick={() => void loadVehicles()}
        >
          Refresh
        </button>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-zinc-700">
          Search vehicle
          <input
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/50"
            placeholder="Type vehicle number..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">
        {vehicles.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-zinc-50 px-3 py-3 text-sm text-zinc-600">
            No vehicles found.
          </div>
        ) : (
          vehicles.map((v) => {
            const isOpen = openVehicle?.toLowerCase() === v.toLowerCase();
            return (
              <div key={v} className="rounded-2xl border border-zinc-200">
                <button
                  type="button"
                  className={[
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-semibold",
                    "hover:bg-zinc-50",
                    isOpen
                      ? "bg-indigo-50 text-indigo-900 ring-1 ring-indigo-100"
                      : "bg-white text-zinc-900",
                  ].join(" ")}
                  onClick={async () => {
                    if (isOpen) {
                      setOpenVehicle(null);
                      setVehicleRecords([]);
                      setError(null);
                      return;
                    }
                    setOpenVehicle(v);
                    onPickVehicle?.(v);
                    await loadVehicleHistory(v);
                  }}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white shadow-sm">
                    <Image src="/vehicle.svg" alt="" width={22} height={22} />
                  </span>
                  <span className="flex-1 truncate">{v}</span>
                  <span className="text-xs font-medium text-zinc-500">
                    {isOpen ? "Hide" : "View"}
                  </span>
                </button>

                {isOpen ? (
                  <div className="border-t bg-white px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                        Count: {vehicleRecords.length}
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                        Total: {openTotal.toFixed(2)}
                      </span>
                    </div>

                    {error ? (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                      </div>
                    ) : null}

                    {loading ? (
                      <div className="mt-3 text-sm text-zinc-600">
                        Loading...
                      </div>
                    ) : vehicleRecords.length === 0 ? (
                      <div className="mt-3 text-sm text-zinc-600">
                        No past records for this vehicle.
                      </div>
                    ) : (
                      <div className="mt-3 overflow-hidden rounded-xl border">
                        <table className="w-full table-fixed">
                          <colgroup>
                            <col className="w-[18%]" />
                            <col className="w-[42%]" />
                            <col className="w-[22%]" />
                            <col className="w-[18%]" />
                          </colgroup>
                          <thead className="bg-zinc-50">
                            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              <th className="px-3 py-2">Date</th>
                              <th className="px-3 py-2">Work</th>
                              <th className="px-3 py-2">Mechanic</th>
                              <th className="px-3 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {vehicleRecords.map((r) => (
                              <tr
                                key={r.id}
                                className="border-t odd:bg-white even:bg-zinc-50/40"
                              >
                                <td className="px-3 py-2 text-zinc-700 whitespace-nowrap">
                                  {formatDate(r.date)}
                                </td>
                                <td className="px-3 py-2 text-zinc-900 break-words">
                                  {r.description}
                                </td>
                                <td className="px-3 py-2 text-zinc-700 truncate">
                                  {r.mechanicName}
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-zinc-900 whitespace-nowrap">
                                  {formatAmount(r.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
