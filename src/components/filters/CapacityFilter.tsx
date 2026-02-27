import { useCallback } from "react";
import type { FilterState } from "../../lib/types";

interface Props {
  filters: FilterState;
  setCapacityRange: (range: [number, number]) => void;
  globalRange: [number, number];
}

export default function CapacityFilter({ filters, setCapacityRange, globalRange }: Props) {
  const [min, max] = filters.capacityRange;
  const [globalMin, globalMax] = globalRange;

  const onMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setCapacityRange([Math.min(val, max), max]);
    },
    [max, setCapacityRange]
  );

  const onMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setCapacityRange([min, Math.max(val, min)]);
    },
    [min, setCapacityRange]
  );

  // Calculate percentage positions for the filled track
  const range = globalMax - globalMin || 1;
  const leftPct = ((min - globalMin) / range) * 100;
  const rightPct = ((max - globalMin) / range) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{min.toLocaleString()} MW</span>
        <span>{max.toLocaleString()} MW</span>
      </div>
      <div className="relative h-5">
        {/* Track background */}
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-200" />
        {/* Active track */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-500"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={globalMin}
          max={globalMax}
          value={min}
          onChange={onMinChange}
          className="pointer-events-none absolute top-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={globalMin}
          max={globalMax}
          value={max}
          onChange={onMaxChange}
          className="pointer-events-none absolute top-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
}
