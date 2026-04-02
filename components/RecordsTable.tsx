"use client";

import type { VehicleRecord } from "@/components/DashboardClient";

type Props = {
  records: VehicleRecord[];
  loading: boolean;
  onEdit: (record: VehicleRecord) => void;
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

export function RecordsTable({ records, loading, onEdit }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <th className="sticky top-0 border-b bg-zinc-50 px-3 py-2">Vehicle</th>
            <th className="sticky top-0 border-b bg-zinc-50 px-3 py-2">Date</th>
            <th className="sticky top-0 border-b bg-zinc-50 px-3 py-2">Description</th>
            <th className="sticky top-0 border-b bg-zinc-50 px-3 py-2">Mechanic</th>
            <th className="sticky top-0 border-b bg-zinc-50 px-3 py-2 text-right">Amount</th>
            <th className="sticky top-0 border-b bg-zinc-50 px-3 py-2 text-right">Edit</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {loading ? (
            <tr>
              <td className="px-3 py-6 text-zinc-600" colSpan={6}>
                Loading...
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-zinc-600" colSpan={6}>
                No records found.
              </td>
            </tr>
          ) : (
            records.map((r) => (
              <tr
                key={r.id}
                className="odd:bg-white even:bg-zinc-50/40 hover:bg-amber-50/40"
              >
                <td className="border-b px-3 py-3 font-medium text-zinc-900">
                  <div className="flex items-center gap-2">
                    <span>{r.vehicleNumber}</span>
                    {r.isEdited ? (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
                        Edited
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="border-b px-3 py-3 text-zinc-700">
                  {formatDate(r.date)}
                </td>
                <td className="border-b px-3 py-3 text-zinc-700">
                  {r.description}
                </td>
                <td className="border-b px-3 py-3 text-zinc-700">
                  {r.mechanicName}
                </td>
                <td className="border-b px-3 py-3 text-right font-semibold text-zinc-900">
                  {formatAmount(r.amount)}
                </td>
                <td className="border-b px-3 py-3 text-right">
                  <button
                    type="button"
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={r.isEdited}
                    title={r.isEdited ? "Already edited" : "Edit record"}
                    onClick={() => onEdit(r)}
                  >
                    {r.isEdited ? "Locked" : "Edit"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

