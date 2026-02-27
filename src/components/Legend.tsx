import { FUEL_COLORS, ALL_FUELS, DC_TYPE_COLORS, DC_TYPE_LABELS, LOAD_TYPE_COLORS, LOAD_TYPE_LABELS } from "../lib/constants";
import type { DCType, LoadType } from "../lib/types";

function rgbToCSS(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

const DC_TYPES: DCType[] = ["hyperscaler", "colo", "enterprise", "ai"];
const LOAD_TYPES: LoadType[] = ["data_center", "crypto", "industrial", "manufacturing"];

export default function Legend() {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Legend</h3>

      {/* Generation Queue */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Generation Queue — by fuel
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {ALL_FUELS.map((fuel) => (
            <div key={fuel} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: rgbToCSS(FUEL_COLORS[fuel]) }}
              />
              <span className="text-[11px] text-gray-600 truncate">{fuel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Centers */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Data Centers — by type
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {DC_TYPES.map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: rgbToCSS(DC_TYPE_COLORS[t]) }}
              />
              <span className="text-[11px] text-gray-600 truncate">{DC_TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Large Loads */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Large Load Queue — rings by MW
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {LOAD_TYPES.map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border-2 flex-shrink-0"
                style={{ borderColor: rgbToCSS(LOAD_TYPE_COLORS[t]) }}
              />
              <span className="text-[11px] text-gray-600 truncate">{LOAD_TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
