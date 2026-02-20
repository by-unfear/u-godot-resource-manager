import { useEffect } from "react";
import { useStore } from "./store";
import { Sidebar } from "./components/Sidebar";
import { ResourceList } from "./components/ResourceList";
import { ResourceForm } from "./components/ResourceForm";
import { Setup } from "./components/Setup";

export default function App() {
  const { projectPath, selectedType, selectedFile } = useStore();

  // Drag-over protection (prevents browser from opening files)
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    document.addEventListener("dragover", prevent);
    document.addEventListener("drop", prevent);
    return () => {
      document.removeEventListener("dragover", prevent);
      document.removeEventListener("drop", prevent);
    };
  }, []);

  if (!projectPath) return <Setup />;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d0d0f]">
      {/* Sidebar — resource types */}
      <Sidebar />

      {/* Resource list */}
      {selectedType && (
        <ResourceList />
      )}

      {/* Form */}
      {selectedFile && (
        <ResourceForm />
      )}

      {/* Empty state when type selected but no file */}
      {selectedType && !selectedFile && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-text-secondary font-mono text-sm">
              Selecione ou crie um resource
            </p>
          </div>
        </div>
      )}

      {/* Empty state when nothing selected */}
      {!selectedType && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-5xl">⬡</div>
            <p className="text-text-secondary font-mono text-sm">
              Selecione um tipo na sidebar
            </p>
            <p className="text-text-muted font-mono text-xs">{projectPath}</p>
          </div>
        </div>
      )}
    </div>
  );
}
