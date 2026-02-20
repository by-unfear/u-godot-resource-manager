import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, X } from "lucide-react";

interface Props { name: string; placeholder?: string; }

export function ArrayStringField({ name, placeholder = "valor" }: Props) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-1">
      {fields.map((field, idx) => (
        <div key={field.id} className="flex gap-1">
          <input
            {...register(`${name}.${idx}`)}
            type="text"
            placeholder={placeholder}
            className="flex-1 bg-bg-base border border-bg-border rounded px-3 py-1.5
              text-sm font-mono text-text-primary placeholder:text-text-muted
              focus:outline-none focus:border-text-muted"
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            className="px-2 text-text-muted hover:text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append("")}
        className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        <Plus size={12} /> Adicionar
      </button>
    </div>
  );
}
