import type { Project } from "../lib/types";

interface Props {
  filtered: Project[];
  allProjects: Project[];
}

function totalGW(projects: Project[]): string {
  const mw = projects.reduce((sum, p) => sum + p.capacityMw, 0);
  return (mw / 1000).toFixed(1);
}

export default function StatsBar({ filtered, allProjects }: Props) {
  return (
    <div className="rounded-md bg-gray-100 px-3 py-2 text-xs text-gray-600">
      <span className="font-semibold text-gray-900">{filtered.length.toLocaleString()}</span>
      {" of "}
      <span>{allProjects.length.toLocaleString()}</span>
      {" projects"}
      <span className="mx-1.5 text-gray-400">|</span>
      <span className="font-semibold text-gray-900">{totalGW(filtered)}</span>
      {" of "}
      <span>{totalGW(allProjects)}</span>
      {" GW"}
    </div>
  );
}
