import { useFormContext } from "react-hook-form";

interface Props { name: string; }

export function Vector3Field({ name }: Props) {
  const { watch, setValue } = useFormContext();
  const val = (watch(name) ?? { x: 0, y: 0, z: 0 }) as { x: number; y: number; z: number };

  const set = (axis: "x" | "y" | "z", v: string) =>
    setValue(name, { ...val, [axis]: parseFloat(v) || 0 }, { shouldDirty: true });

  return (
    <div className="grid grid-cols-3 gap-1">
      {(["x", "y", "z"] as const).map((axis) => (
        <div key={axis} className="flex">
          <span className="flex items-center px-2 bg-bg-active border border-r-0 border-bg-border rounded-l text-xs font-mono text-text-muted uppercase">
            {axis}
          </span>
          <input
            type="number" step={0.01}
            value={val[axis]}
            onChange={(e) => set(axis, e.target.value)}
            className="flex-1 min-w-0 bg-bg-base border border-bg-border rounded-r px-2 py-1.5
              text-sm font-mono text-text-primary focus:outline-none focus:border-text-muted"
          />
        </div>
      ))}
    </div>
  );
}
