import { DashboardClient } from "@/components/DashboardClient";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white text-zinc-900">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border bg-white p-2 shadow-sm">
              <Image
                src="/jmmr-logo.png"
                alt="JMMR"
                width={56}
                height={56}
                priority
              />
            </div>
            <div className="leading-tight">
              <h1 className="text-xl font-semibold tracking-tight">
                JMMR Maintenance Records
              </h1>
              <div className="text-xs text-zinc-500">
                Vehicle maintenance dashboard
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <DashboardClient />
      </main>
    </div>
  );
}

