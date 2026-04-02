"use client";

import { useState } from "react";
import { RecordForm } from "@/components/RecordForm";
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
  const [editing, setEditing] = useState<VehicleRecord | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehiclesRefreshKey, setVehiclesRefreshKey] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <VehicleDropdownList
        search={vehicleSearch}
        onSearchChange={setVehicleSearch}
        refreshKey={vehiclesRefreshKey}
      />

      <section className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-50 to-white px-3 py-3 text-left"
          onClick={() => setAddOpen((v) => !v)}
        >
          <div>
            <div className="text-base font-semibold">Add record</div>
            <div className="mt-1 text-xs text-zinc-500">
              Click to {addOpen ? "close" : "open"} the form
            </div>
          </div>
          <div className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm">
            {addOpen ? "Close" : "Add"}
          </div>
        </button>

        {addOpen ? (
          <div className="mt-4">
            <RecordForm
              onCreated={() => {
                setAddOpen(false);
                setVehiclesRefreshKey((k) => k + 1);
              }}
            />
          </div>
        ) : null}
      </section>

      <EditRecordModal
        record={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          setVehiclesRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}

