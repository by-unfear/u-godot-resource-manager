import { useFormContext } from "react-hook-form";
import type { SchemaField } from "../../types";

interface Props { name: string; field: SchemaField; isInt?: boolean; }

export function NumberField({ name, field, isInt }: Props) {
  const { register } = useFormContext();
  return (
    <input
      {...register(name, { valueAsNumber: true })}
      type="number"
      min={field.min}
      max={field.max}
      step={isInt ? 1 : (field.step ?? 0.01)}
      className="w-full bg-bg-base border border-bg-border rounded px-3 py-1.5
        text-sm font-mono text-text-primary focus:outline-none focus:border-text-muted transition-colors"
    />
  );
}
