import type { Project, DataCenter, LargeLoad } from "../lib/types";
import { FUEL_COLORS, STATUS_COLORS, DC_TYPE_COLORS, DC_TYPE_LABELS, LOAD_TYPE_COLORS, LOAD_TYPE_LABELS, getTDU } from "../lib/constants";

interface Props {
  x: number;
  y: number;
  object: Project | DataCenter | LargeLoad;
}

function rgbToCSS(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function isProject(obj: any): obj is Project {
  return "fuel" in obj;
}

function isDataCenter(obj: any): obj is DataCenter {
  return "operator" in obj;
}

function isLargeLoad(obj: any): obj is LargeLoad {
  return "requestedMw" in obj;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-gray-400">{children}</span>;
}

function ProjectTooltip({ project }: { project: Project }) {
  const rgb = FUEL_COLORS[project.fuel];
  const fuelColor = rgbToCSS(rgb);
  const statusColor = STATUS_COLORS[project.status];
  const tdu = project.county ? getTDU(project.county) : null;

  return (
    <>
      <div className="mb-1 font-semibold text-sm leading-tight">{project.name}</div>
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fuelColor }} />
          <span>{project.fuel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
          <span>{project.status}</span>
        </div>
        <div><Label>Capacity:</Label> {project.capacityMw.toLocaleString()} MW</div>
        {project.codYear && (
          <div><Label>COD Year:</Label> {project.codYear}</div>
        )}
        <div><Label>County:</Label> {project.county || "N/A"}</div>
        {tdu && <div><Label>Utility:</Label> {tdu}</div>}
      </div>
    </>
  );
}

function DataCenterTooltip({ dc }: { dc: DataCenter }) {
  const color = rgbToCSS(DC_TYPE_COLORS[dc.type]);
  const tdu = dc.county ? getTDU(dc.county) : null;

  return (
    <>
      <div className="mb-1 font-semibold text-sm leading-tight">{dc.name}</div>
      <div className="space-y-0.5">
        <div><Label>Operator:</Label> {dc.operator}</div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span>{DC_TYPE_LABELS[dc.type]}</span>
        </div>
        <div><Label>Status:</Label> {dc.status}</div>
        {dc.capacityMw != null && (
          <div><Label>Capacity:</Label> {dc.capacityMw.toLocaleString()} MW</div>
        )}
        {dc.usageMw != null && dc.usageMw > 0 && (
          <div><Label>Current draw:</Label> {dc.usageMw.toLocaleString()} MW</div>
        )}
        <div><Label>Location:</Label> {dc.city}, {dc.county} County</div>
        {tdu && <div><Label>Utility:</Label> {tdu}</div>}
      </div>
    </>
  );
}

function LargeLoadTooltip({ load }: { load: LargeLoad }) {
  const color = rgbToCSS(LOAD_TYPE_COLORS[load.type]);
  const tdu = load.county ? getTDU(load.county) : null;

  return (
    <>
      <div className="mb-1 font-semibold text-sm leading-tight">{load.name}</div>
      <div className="space-y-0.5">
        <div><Label>Entity:</Label> {load.entity}</div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span>{LOAD_TYPE_LABELS[load.type]}</span>
        </div>
        <div><Label>Requested:</Label> {load.requestedMw.toLocaleString()} MW</div>
        <div><Label>County:</Label> {load.county}</div>
        {tdu && <div><Label>Utility:</Label> {tdu}</div>}
        {load.yearFiled > 0 && (
          <div><Label>Year Filed:</Label> {load.yearFiled}</div>
        )}
      </div>
    </>
  );
}

export default function Tooltip({ x, y, object }: Props) {
  const offsetX = 12;
  const offsetY = 12;

  return (
    <div
      className="pointer-events-none absolute z-50 max-w-xs rounded-md bg-bp-dark/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm"
      style={{
        left: x + offsetX,
        top: y + offsetY,
        transform: x > window.innerWidth - 280 ? "translateX(-110%)" : undefined,
      }}
    >
      {isProject(object) && <ProjectTooltip project={object} />}
      {isDataCenter(object) && <DataCenterTooltip dc={object} />}
      {isLargeLoad(object) && <LargeLoadTooltip load={object} />}
    </div>
  );
}
