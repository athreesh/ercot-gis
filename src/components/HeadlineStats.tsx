import type { Project, DataCenter, LargeLoad } from "../lib/types";

interface Props {
  projects: Project[];
  dataCenters: DataCenter[];
  largeLoads: LargeLoad[];
}

function totalGW(mw: number): string {
  return (mw / 1000).toFixed(0);
}

export default function HeadlineStats({ projects, dataCenters, largeLoads }: Props) {
  const supplyMw = projects.reduce((sum, p) => sum + p.capacityMw, 0);
  const demandMw = largeLoads.reduce((sum, l) => sum + l.requestedMw, 0);
  const dcCount = dataCenters.length;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-center">
          <div className="text-2xl font-bold text-emerald-700">{totalGW(supplyMw)} GW</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">Supply in queue</div>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-center">
          <div className="text-2xl font-bold text-amber-700">{totalGW(demandMw)} GW</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-amber-600">Demand requested</div>
        </div>
      </div>
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-center">
        <span className="text-lg font-bold text-blue-700">{dcCount}</span>
        <span className="ml-1.5 text-xs text-blue-600">data centers on the ground in TX</span>
      </div>
    </div>
  );
}
