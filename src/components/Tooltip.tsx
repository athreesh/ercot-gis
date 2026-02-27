import type { Project, DataCenter, LargeLoad } from "../lib/types";
import { FUEL_COLORS, STATUS_COLORS, DC_TYPE_COLORS, DC_TYPE_LABELS, LOAD_TYPE_COLORS, LOAD_TYPE_LABELS } from "../lib/constants";

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

function ProjectTooltip({ project }: { project: Project }) {
  const rgb = FUEL_COLORS[project.fuel];
  const fuelColor = rgbToCSS(rgb);
  const statusColor = STATUS_COLORS[project.status];

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
        <div>
          <span className="text-gray-400">Capacity:</span> {project.capacityMw.toLocaleString()} MW
        </div>
        {project.codYear && (
          <div><span className="text-gray-400">COD Year:</span> {project.codYear}</div>
        )}
        <div><span className="text-gray-400">County:</span> {project.county || "N/A"}</div>
      </div>
    </>
  );
}

function DataCenterTooltip({ dc }: { dc: DataCenter }) {
  const color = rgbToCSS(DC_TYPE_COLORS[dc.type]);
  return (
    <>
      <div className="mb-1 font-semibold text-sm leading-tight">{dc.name}</div>
      <div className="space-y-0.5">
        <div><span className="text-gray-400">Operator:</span> {dc.operator}</div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span>{DC_TYPE_LABELS[dc.type]}</span>
        </div>
        <div><span className="text-gray-400">Status:</span> {dc.status}</div>
        {dc.capacityMw != null && (
          <div><span className="text-gray-400">Capacity:</span> {dc.capacityMw.toLocaleString()} MW</div>
        )}
        <div><span className="text-gray-400">Location:</span> {dc.city}, {dc.county} County</div>
      </div>
    </>
  );
}

function LargeLoadTooltip({ load }: { load: LargeLoad }) {
  const color = rgbToCSS(LOAD_TYPE_COLORS[load.type]);
  return (
    <>
      <div className="mb-1 font-semibold text-sm leading-tight">{load.name}</div>
      <div className="space-y-0.5">
        <div><span className="text-gray-400">Entity:</span> {load.entity}</div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span>{LOAD_TYPE_LABELS[load.type]}</span>
        </div>
        <div><span className="text-gray-400">Requested:</span> {load.requestedMw.toLocaleString()} MW</div>
        <div><span className="text-gray-400">County:</span> {load.county}</div>
        {load.yearFiled > 0 && (
          <div><span className="text-gray-400">Year Filed:</span> {load.yearFiled}</div>
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
      className="pointer-events-none absolute z-50 max-w-xs rounded-lg bg-gray-900/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm"
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
