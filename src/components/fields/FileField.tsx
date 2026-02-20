import { useFormContext } from "react-hook-form";
import { FolderOpen } from "lucide-react";
import { pickFile } from "../../lib/fs";

interface Props { name: string; filter?: string; }

export function FileField({ name, filter }: Props) {
  const { register, setValue, watch } = useFormContext();
  const value = watch(name) as string;

  const handlePick = async () => {
    // Parse filter like "*.tscn" or "*.ogg,*.mp3"
    const extensions = filter
      ? filter.split(",").map((f) => f.trim().replace("*.", ""))
      : undefined;
    const filters = extensions ? [{ name: "Files", extensions }] : undefined;
    const file = await pickFile(filters);
    if (file) setValue(name, file, { shouldDirty: true });
  };

  return (
    <div className="flex gap-1">
      <input
        {...register(name)}
        type="text"
        placeholder={filter ?? "path/to/file"}
        className="flex-1 bg-bg-base border border-bg-border rounded-l px-3 py-1.5
          text-sm font-mono text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-text-muted transition-colors"
      />
      <button
        type="button"
        onClick={handlePick}
        className="px-2.5 bg-bg-active border border-bg-border rounded-r
          text-text-muted hover:text-text-primary transition-colors"
      >
        <FolderOpen size={14} />
      </button>
    </div>
  );
}
