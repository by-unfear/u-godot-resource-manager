import { useFormContext } from "react-hook-form";

interface Props { name: string; }

// Stores as { r, g, b, a } 0-1 floats, displays as hex picker
export function ColorField({ name }: Props) {
  const { watch, setValue } = useFormContext();
  const val = (watch(name) ?? { r: 1, g: 1, b: 1, a: 1 }) as { r: number; g: number; b: number; a: number };

  const toHex = (v: { r: number; g: number; b: number }) =>
    "#" + [v.r, v.g, v.b].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");

  const fromHex = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b, a: val.a };
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={toHex(val)}
        onChange={(e) => setValue(name, fromHex(e.target.value), { shouldDirty: true })}
        className="w-10 h-8 rounded border border-bg-border cursor-pointer bg-transparent"
      />
      <span className="text-xs font-mono text-text-muted">{toHex(val)}</span>
      <div className="flex items-center gap-1 ml-4">
        <label className="text-xs text-text-muted font-mono">A</label>
        <input
          type="range" min={0} max={1} step={0.01}
          value={val.a}
          onChange={(e) => setValue(name, { ...val, a: parseFloat(e.target.value) }, { shouldDirty: true })}
          className="w-20"
        />
        <span className="text-xs font-mono text-text-muted w-8">{val.a.toFixed(2)}</span>
      </div>
    </div>
  );
}
