import type { ViewMode, FilterState } from "../../lib/types";

interface Props {
  filters: FilterState;
  setViewMode: (mode: ViewMode) => void;
}

const modes: { value: ViewMode; label: string }[] = [
  { value: "scatter", label: "Scatter" },
  { value: "hex", label: "Hexbin" },
  { value: "heatmap", label: "Heatmap" },
];

export default function ViewModeToggle({ filters, setViewMode }: Props) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-0.5">
      {modes.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setViewMode(value)}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            filters.viewMode === value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
