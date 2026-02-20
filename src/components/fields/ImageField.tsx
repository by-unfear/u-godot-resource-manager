import { useFormContext } from "react-hook-form";
import { FolderOpen, ImageOff } from "lucide-react";
import { pickFile, toImageSrc } from "../../lib/fs";

interface Props { name: string; }

export function ImageField({ name }: Props) {
  const { register, setValue, watch } = useFormContext();
  const value = watch(name) as string;

  const handlePick = async () => {
    const file = await pickFile([{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "svg"] }]);
    if (file) setValue(name, file, { shouldDirty: true });
  };

  return (
    <div className="flex gap-3 items-start">
      {/* Preview */}
      <div className="w-16 h-16 rounded border border-bg-border bg-bg-base flex items-center justify-center shrink-0 overflow-hidden">
        {value ? (
          <img
            src={toImageSrc(value)}
            alt="preview"
            className="w-full h-full object-contain"
          />
        ) : (
          <ImageOff size={20} className="text-text-muted" />
        )}
      </div>

      {/* Path + picker */}
      <div className="flex-1 space-y-1">
        <input
          {...register(name)}
          type="text"
          placeholder="path/to/image.png"
          className="w-full bg-bg-base border border-bg-border rounded px-3 py-1.5
            text-xs font-mono text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-text-muted transition-colors"
        />
        <button
          type="button"
          onClick={handlePick}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <FolderOpen size={12} />
          Escolher imagem
        </button>
      </div>
    </div>
  );
}
