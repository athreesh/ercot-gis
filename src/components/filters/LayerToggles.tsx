import type { LayerVisibility } from "../../lib/types";

interface Props {
  layers: LayerVisibility;
  showTerritory: boolean;
  hasTerritory: boolean;
  setLayerVisibility: (layer: keyof LayerVisibility, on: boolean) => void;
  setShowTerritory: (on: boolean) => void;
}

const LAYER_CONFIG: { key: keyof LayerVisibility; label: string; icon: string; color: string }[] = [
  { key: "generationQueue", label: "Generation Queue", icon: "●", color: "#FFB71B" },
  { key: "dataCenters", label: "Data Centers", icon: "◆", color: "#0A9D6E" },
  { key: "largeLoads", label: "Large Load Queue", icon: "○", color: "#EF4444" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-bp-accent" : "bg-bp-border"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function LayerToggles({ layers, showTerritory, hasTerritory, setLayerVisibility, setShowTerritory }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-bp-muted">Layers</h3>
      <div className="space-y-1.5">
        {LAYER_CONFIG.map(({ key, label, icon, color }) => (
          <label key={key} className="flex cursor-pointer items-center justify-between py-0.5">
            <span className="flex items-center gap-2 text-sm text-bp-dark">
              <span style={{ color }}>{icon}</span>
              {label}
            </span>
            <Toggle checked={layers[key]} onChange={(on) => setLayerVisibility(key, on)} />
          </label>
        ))}
        {hasTerritory && (
          <label className="flex cursor-pointer items-center justify-between py-0.5">
            <span className="flex items-center gap-2 text-sm text-bp-dark">
              <span className="text-bp-border">▢</span>
              Service Territory
            </span>
            <Toggle checked={showTerritory} onChange={setShowTerritory} />
          </label>
        )}
      </div>
    </div>
  );
}
