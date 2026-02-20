import { useFormContext } from "react-hook-form";
import { useStore } from "../../store";

interface Props { name: string; resourceType: string; }

export function RelationField({ name, resourceType }: Props) {
  const { register } = useFormContext();
  const resources = useStore((s) => s.resources[resourceType] ?? []);

  return (
    <div className="flex gap-1">
      <select
        {...register(name)}
        className="flex-1 bg-bg-base border border-bg-border rounded px-3 py-1.5
          text-sm font-mono text-text-primary focus:outline-none focus:border-text-muted
          transition-colors cursor-pointer"
      >
        <option value="">— nenhum —</option>
        {resources.map((rec) => (
          <option key={rec._path} value={rec._file}>
            {rec._file}
          </option>
        ))}
      </select>
      {resources.length === 0 && (
        <span className="flex items-center text-[10px] font-mono text-text-muted">
          (carregue {resourceType} primeiro)
        </span>
      )}
    </div>
  );
}
