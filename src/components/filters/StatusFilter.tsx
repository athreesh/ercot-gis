import type { Status, FilterState } from "../../lib/types";
import { ALL_STATUSES, STATUS_COLORS } from "../../lib/constants";

interface Props {
  filters: FilterState;
  setStatus: (status: Status, on: boolean) => void;
}

export default function StatusFilter({ filters, setStatus }: Props) {
  return (
    <div className="space-y-1">
      {ALL_STATUSES.map((status) => {
        const checked = filters.statuses[status];
        return (
          <label
            key={status}
            className="flex cursor-pointer items-center justify-between rounded px-1 py-0.5 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span className="text-sm text-gray-700">{status}</span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setStatus(status, e.target.checked)}
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
