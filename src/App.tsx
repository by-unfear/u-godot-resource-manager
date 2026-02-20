import { useEffect } from "react";
import { useStore } from "./store";
import { Sidebar } from "./components/Sidebar";
import { ResourceList } from "./components/ResourceList";
import { ResourceForm } from "./components/ResourceForm";
import { Setup } from "./components/Setup";
import { SchemaEditor } from "./components/SchemaEditor";

import { loadSchemas } from "./lib/fs";
import { ALL_SCHEMAS } from "./lib/schemas";

export default function App() {
  const { projectPath, selectedType, selectedFile, editingSchema, setSchemas, setResourceFolder } = useStore();

  // Load schemas on startup or project switch
  useEffect(() => {
    if (projectPath) {
        loadSchemas(projectPath).then(found => {
            if (found.length > 0) {
                setSchemas(found);
            } else {
                setSchemas(ALL_SCHEMAS);
            }
        });
        // Load resource folder setting
        const savedFolder = localStorage.getItem(`grm.folder.${projectPath}`);
        if (savedFolder) {
            setResourceFolder(savedFolder);
        } else {
            setResourceFolder("resources"); // Default
        }
    } else {
        setSchemas([]); // Clear schemas if no project path
        setResourceFolder("resources"); // Reset folder
    }
  }, [projectPath, setSchemas, setResourceFolder]);

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

  const projectName = projectPath ? projectPath.split(/[\\/]/).pop() : "No Project";

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d0d0f] text-text-primary font-sans">
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
          {editingSchema ? (
            <SchemaEditor />
          ) : (
            <>
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
                <div className="flex-1 flex items-center justify-center bg-bg-base/50">
                  <div className="text-center space-y-2">
                    <p className="text-text-secondary font-mono text-sm">
                      Selecione ou crie um resource
                    </p>
                  </div>
                </div>
              )}
        
              {/* Empty state when nothing selected */}
              {!selectedType && (
                <div className="flex-1 flex items-center justify-center bg-bg-base/50">
                  <div className="text-center space-y-3">
                    <div className="text-5xl text-text-muted opacity-20">⬡</div>
                    <p className="text-text-secondary font-mono text-sm">
                      Selecione um tipo na sidebar
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
      </div>

      {/* Global Status Footer */}
      <footer className="h-6 bg-bg-panel border-t border-bg-border flex items-center px-3 text-[10px] font-mono text-text-muted shrink-0 select-text z-50">
          <span className="font-bold text-text-secondary mr-2">{projectName}</span>
          <span className="mx-2 opacity-20">|</span>
          <span className="opacity-70 truncate" title={projectPath}>{projectPath}</span>
      </footer>
    </div>
  );
}
