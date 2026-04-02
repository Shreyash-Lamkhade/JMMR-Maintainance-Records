"use client";

import { useEffect, useMemo, useState } from "react";
import { RecordForm } from "@/components/RecordForm";
import { RecordsTable } from "@/components/RecordsTable";
import { EditRecordModal } from "@/components/EditRecordModal";

export type VehicleRecord = {
  id: number;
  vehicleNumber: string;
  date: string;
  description: string;
  mechanicName: string;
  amount: number;
  isEdited: boolean;
  createdAt: string;
};

export function DashboardClient() {
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<VehicleRecord | null>(null);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const queryUrl = useMemo(() => {
    const q = search.trim();
    if (selectedVehicle) {
      return `/api/records?vehicle=${encodeURIComponent(selectedVehicle)}&exact=1`;
    }
    return q ? `/api/records?vehicle=${encodeURIComponent(q)}` : "/api/records";
  }, [search, selectedVehicle]);

  const vehiclesUrl = useMemo(() => {
    const q = search.trim();
    return q ? `/api/records/vehicles?vehicle=${encodeURIComponent(q)}` : "/api/records/vehicles";
  }, [search]);

  async function loadVehicles() {
    try {
      const res = await fetch(vehiclesUrl, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as string[];
      setVehicles(data);
    } catch {
      // ignore: vehicles list is optional UI
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(queryUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = (await res.json()) as VehicleRecord[];
      setRecords(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryUrl]);

  useEffect(() => {
    void loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiclesUrl]);

  const totalAmount = useMemo(() => {
    return records.reduce((sum, r) => sum + (Number.isFinite(r.amount) ? r.amount : 0), 0);
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/5 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Vehicles</h2>
              <div className="mt-1 text-xs text-zinc-500">
                Click to view full history
              </div>
            </div>
            {selectedVehicle ? (
              <button
                type="button"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
                onClick={() => setSelectedVehicle(null)}
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="mt-4 max-h-[360px] space-y-2 overflow-auto pr-1">
            {vehicles.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-zinc-50 px-3 py-3 text-sm text-zinc-600">
                No vehicles yet.
              </div>
            ) : (
              vehicles.map((v) => {
                const active = selectedVehicle?.toLowerCase() === v.toLowerCase();
                return (
                  <button
                    key={v}
                    type="button"
                    className={[
                      "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-semibold shadow-sm",
                      active
                        ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                        : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
                    ].join(" ")}
                    onClick={() => {
                      setSelectedVehicle(v);
                      setSearch(v);
                    }}
                  >
                    <span className="truncate">{v}</span>
                    <span className="text-xs font-medium text-zinc-500">
                      History
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <div className="grid gap-6 lg:col-span-8 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Add record</h2>
              <div className="mt-1 text-xs text-zinc-500">
                Required fields only
              </div>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              Create
            </div>
          </div>
          <div className="mt-4">
            <RecordForm
              onCreated={() => {
                setSearch("");
                setSelectedVehicle(null);
                void load();
                void loadVehicles();
              }}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Search</h2>
              <div className="mt-1 text-xs text-zinc-500">
                Vehicle number filter
              </div>
            </div>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">
              Filter
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700">
              Vehicle number
              <input
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/50"
                placeholder="e.g. ABC-123"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedVehicle(null);
                }}
              />
            </label>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                onClick={() => void load()}
              >
                Search
              </button>
              <button
                type="button"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
                onClick={() => {
                  setSearch("");
                  setSelectedVehicle(null);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </section>
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">
              {selectedVehicle ? `History: ${selectedVehicle}` : "Records"}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
                Count: {records.length}
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                Total amount: {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
            onClick={() => {
              void load();
              void loadVehicles();
            }}
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4">
          <RecordsTable
            records={records}
            loading={loading}
            onEdit={(r) => setEditing(r)}
          />
        </div>
      </section>

      <EditRecordModal
        record={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          void load();
        }}
      />
    </div>
  );
}

