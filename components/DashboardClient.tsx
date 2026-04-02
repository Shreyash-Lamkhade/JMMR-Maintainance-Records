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

  const queryUrl = useMemo(() => {
    const q = search.trim();
    return q ? `/api/records?vehicle=${encodeURIComponent(q)}` : "/api/records";
  }, [search]);

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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
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
                void load();
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
                onChange={(e) => setSearch(e.target.value)}
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
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Records</h2>
          </div>
          <button
            type="button"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
            onClick={() => void load()}
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

