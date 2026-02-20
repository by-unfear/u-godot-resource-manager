import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { FieldRenderer } from "./FieldRenderer";
import type { SchemaField } from "../../types";

interface Props {
  name: string;
  fields: SchemaField[];
  innerLabel: string;
}

function buildInnerDefault(fields: SchemaField[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const f of fields) {
    switch (f.type) {
      case "string": case "text": case "file": case "image": case "relation": obj[f.key] = ""; break;
      case "int": case "float": obj[f.key] = f.default ?? 0; break;
      case "bool": obj[f.key] = false; break;
      case "enum": obj[f.key] = f.options?.[0] ?? ""; break;
      case "array_string": case "array_relation": case "inner_array": obj[f.key] = []; break;
      default: obj[f.key] = null;
    }
  }
  return obj;
}

export function InnerArrayField({ name, fields, innerLabel }: Props) {
  const { control } = useFormContext();
  const { fields: items, append, remove } = useFieldArray({ control, name });
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-1">
      {items.map((item, idx) => {
        const isExpanded = expanded[idx] !== false; // default expanded
        return (
          <div key={item.id} className="border border-bg-border rounded overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-bg-active">
              <button
                type="button"
                onClick={() => setExpanded((e) => ({ ...e, [idx]: !isExpanded }))}
                className="text-text-muted"
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <span className="text-xs font-mono text-text-secondary flex-1">
                {innerLabel} #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-text-muted hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
            {isExpanded && (
              <div className="px-3 py-2 space-y-2">
                {fields.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    prefix={`${name}.${idx}`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => {
          const idx = items.length;
          append(buildInnerDefault(fields));
          setExpanded((e) => ({ ...e, [idx]: true }));
        }}
        className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        <Plus size={12} /> Adicionar {innerLabel}
      </button>
    </div>
  );
}
