import { FolderOpen } from "lucide-react";
import { useStore } from "../store";
import { pickDirectory } from "../lib/fs";

export function Setup() {
  const setProjectPath = useStore((s) => s.setProjectPath);

  const handle = async () => {
    const dir = await pickDirectory();
    if (dir) setProjectPath(dir);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0d0d0f]">
      <div className="flex flex-col items-center gap-8 max-w-sm text-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Resource Manager
          </h1>
          <p className="text-text-secondary text-sm font-mono">
            Godot Data Editor
          </p>
        </div>

        <div className="w-full border border-dashed border-bg-border rounded-lg p-8 space-y-4">
          <p className="text-text-secondary text-sm">
            Selecione a pasta onde ficam seus resources{" "}
            <span className="font-mono text-text-muted">(.json / .tres)</span>
          </p>
          <button
            onClick={handle}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-md bg-bg-active
              border border-bg-border text-text-primary text-sm font-medium
              hover:bg-bg-hover hover:border-text-muted transition-all"
          >
            <FolderOpen size={16} />
            Abrir pasta do projeto
          </button>
        </div>

        <p className="text-text-muted text-xs font-mono">
          Esta pasta será lembrada entre sessões
        </p>
      </div>
    </div>
  );
}
