import type { Project, DataCenter, LargeLoad } from "../lib/types";
import { ERCOT_GRID } from "../lib/constants";

interface Props {
  projects: Project[];
  dataCenters: DataCenter[];
  largeLoads: LargeLoad[];
}

export default function HeadlineStats({ projects, dataCenters, largeLoads }: Props) {
  const supplyGw = projects.reduce((sum, p) => sum + p.capacityMw, 0) / 1000;
  const demandGw = largeLoads.reduce((sum, l) => sum + l.requestedMw, 0) / 1000;
  const operationalDCs = dataCenters.filter((d) => d.status === "operational");
  const currentUsageMw = operationalDCs.reduce((sum, d) => sum + (d.usageMw ?? 0), 0);
  const totalCapacityMw = dataCenters.reduce((sum, d) => sum + (d.capacityMw ?? 0), 0);
  const dcDemandLoads = largeLoads.filter((l) => l.type === "data_center");
  const dcDemandPct = demandGw > 0 ? Math.round(dcDemandLoads.reduce((s, l) => s + l.requestedMw, 0) / (demandGw * 1000) * 100) : 0;

  return (
    <div className="space-y-2.5">
      {/* ERCOT grid context */}
      <div className="rounded-md bg-bp-warm px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-bp-muted mb-1">
          ERCOT Grid Today
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-lg font-bold text-bp-dark">{ERCOT_GRID.installedCapacityGw}</span>
            <span className="text-xs text-bp-muted ml-1">GW installed</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-bp-dark">{ERCOT_GRID.peakDemandGw}</span>
            <span className="text-xs text-bp-muted ml-1">GW peak</span>
          </div>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-bp-border overflow-hidden">
          <div
            className="h-full rounded-full bg-bp-accent"
            style={{ width: `${(ERCOT_GRID.peakDemandGw / ERCOT_GRID.installedCapacityGw * 100).toFixed(0)}%` }}
          />
        </div>
        <div className="mt-0.5 text-[9px] text-bp-muted text-right">
          {(ERCOT_GRID.peakDemandGw / ERCOT_GRID.installedCapacityGw * 100).toFixed(0)}% utilization at peak ({ERCOT_GRID.peakDemandDate})
        </div>
      </div>

      {/* Supply vs Demand queue */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-bp-warm px-3 py-2 text-center">
          <div className="text-xl font-bold text-bp-accent">{supplyGw.toFixed(0)} GW</div>
          <div className="text-[9px] font-medium uppercase tracking-wider text-bp-muted">Generation queued</div>
        </div>
        <div className="rounded-md bg-bp-warm px-3 py-2 text-center">
          <div className="text-xl font-bold" style={{ color: "#C2410C" }}>{demandGw.toFixed(0)} GW</div>
          <div className="text-[9px] font-medium uppercase tracking-wider text-bp-muted">Load requested</div>
        </div>
      </div>

      {/* The problem */}
      <div className="rounded-md border border-bp-border px-3 py-2">
        <div className="text-[11px] leading-relaxed text-bp-muted">
          <span className="font-semibold text-bp-dark">{dcDemandPct}%</span> of load requests are data centers.
          The grid peaked at {ERCOT_GRID.peakDemandGw} GW — new demand alone equals{" "}
          <span className="font-semibold text-bp-dark">{Math.round(demandGw / ERCOT_GRID.peakDemandGw * 100)}%</span> of that record.
        </div>
      </div>

      {/* Data center power */}
      <div className="rounded-md bg-bp-warm px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-bp-muted mb-1.5">
          TX Data Centers
        </div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-base font-bold text-bp-dark">{dataCenters.length}</div>
            <div className="text-[9px] text-bp-muted">Facilities</div>
          </div>
          <div>
            <div className="text-base font-bold text-bp-accent">{(currentUsageMw / 1000).toFixed(1)} GW</div>
            <div className="text-[9px] text-bp-muted">Drawing now</div>
          </div>
          <div>
            <div className="text-base font-bold text-bp-dark">{(totalCapacityMw / 1000).toFixed(1)} GW</div>
            <div className="text-[9px] text-bp-muted">Capacity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
