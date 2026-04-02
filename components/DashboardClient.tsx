"use client";

import { useEffect, useMemo, useState } from "react";
import { RecordForm } from "@/components/RecordForm";
import { RecordsTable } from "@/components/RecordsTable";
import { EditRecordModal } from "@/components/EditRecordModal";
import { VehicleDropdownList } from "@/components/VehicleDropdownList";

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
  const [allRecords, setAllRecords] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<VehicleRecord | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState("");

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/records", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = (await res.json()) as VehicleRecord[];
      setAllRecords(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const totalAmount = useMemo(() => {
    return allRecords.reduce(
      (sum, r) => sum + (Number.isFinite(r.amount) ? r.amount : 0),
      0,
    );
  }, [allRecords]);

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
                void loadAll();
              }}
            />
          </div>
        </section>

        <VehicleDropdownList
          search={vehicleSearch}
          onSearchChange={setVehicleSearch}
          onPickVehicle={() => {
            // optional hook; keep All History untouched
          }}
        />
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">All history</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
                Count: {allRecords.length}
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
              void loadAll();
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
            records={allRecords}
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
          void loadAll();
        }}
      />
    </div>
  );
}

