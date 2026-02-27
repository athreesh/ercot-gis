import type { FuelType, FilterState } from "../../lib/types";
import { ALL_FUELS, FUEL_COLORS } from "../../lib/constants";

interface Props {
  filters: FilterState;
  setFuel: (fuel: FuelType, on: boolean) => void;
}

function rgbToCSS(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export default function FuelTypeFilter({ filters, setFuel }: Props) {
  return (
    <div className="space-y-1">
      {ALL_FUELS.map((fuel) => {
        const checked = filters.fuels[fuel];
        return (
          <label
            key={fuel}
            className="flex cursor-pointer items-center justify-between rounded px-1 py-0.5 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: rgbToCSS(FUEL_COLORS[fuel]) }}
              />
              <span className="text-sm text-gray-700">{fuel}</span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setFuel(fuel, e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-blue-500 transition-colors" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
          </label>
        );
      })}
    </div>
  );
}
