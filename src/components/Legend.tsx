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
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-bp-muted">Legend</h3>

      {/* Generation Queue */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-bp-muted">
          Generation Queue — by fuel
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {ALL_FUELS.map((fuel) => (
            <div key={fuel} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: rgbToCSS(FUEL_COLORS[fuel]) }}
              />
              <span className="text-[11px] text-bp-dark">{fuel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Centers */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-bp-muted">
          Data Centers — by type
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {DC_TYPES.map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-sm flex-shrink-0"
                style={{ backgroundColor: rgbToCSS(DC_TYPE_COLORS[t]) }}
              />
              <span className="text-[11px] text-bp-dark">{DC_TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Large Loads */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-bp-muted">
          Large Load Queue — rings by MW
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {LOAD_TYPES.map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full border-[1.5px] flex-shrink-0"
                style={{ borderColor: rgbToCSS(LOAD_TYPE_COLORS[t]) }}
              />
              <span className="text-[11px] text-bp-dark">{LOAD_TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TDU territories */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-bp-muted">
          Utility Territories (TDU)
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-bp-dark">
          <div>Oncor — DFW, Central</div>
          <div>CenterPoint — Houston</div>
          <div>AEP Texas — South/West</div>
          <div>TNMP — scattered</div>
        </div>
      </div>
    </div>
  );
}
