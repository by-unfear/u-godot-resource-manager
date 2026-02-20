import { FolderOpen, Settings, Settings2 } from "lucide-react";
import { useStore } from "../store";
import { SCHEMA_CATEGORIES, SCHEMA_MAP } from "../lib/schemas";
import { pickDirectory } from "../lib/fs";
import type { Schema } from "../types";

export function Sidebar() {
  const { selectedType, setSelectedType, setProjectPath, projectPath, triggerRefresh, editingSchema, setEditingSchema, schemas } = useStore();

  const handleChangeProject = async () => {
    const dir = await pickDirectory();
    if (dir) setProjectPath(dir);
  };

  return (
    <aside className="flex flex-col w-56 h-screen border-r border-bg-border bg-bg-panel shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border shrink-0">
        <h1 className="font-bold text-sm tracking-wide text-text-muted">RESOURCES</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              // Lógica de escolher pasta
              const current = localStorage.getItem(`grm.folder.${projectPath}`) || "resources";
              const newFolder = prompt("Caminho da pasta de recursos (relativo ao projeto):", current);
              if (newFolder !== null) {
                localStorage.setItem(`grm.folder.${projectPath}`, newFolder);
                // Força um reload simples para aplicar
                window.location.reload();
              }
            }}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="Pasta de Recursos"
          >
            <FolderOpen size={16} />
          </button>
          
          <button
            onClick={() => setEditingSchema(true)}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="Editar Schemas"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-1">
        {Object.entries(schemas.reduce((acc, schema: Schema) => {
          let category = "Custom";
          for (const cat of SCHEMA_CATEGORIES) {
              if (cat.types.includes(schema.type)) {
                  category = cat.label;
                  break;
              }
          }
          if (!acc[category]) acc[category] = [];
          acc[category].push(schema);
          return acc;
        }, {} as Record<string, Schema[]>)).map(([label, list]) => (
          <div key={label} className="mb-2">
            <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted/70">
              {label}
            </p>
            <div className="space-y-0.5">
                {list.map((schema) => {
                  const active = selectedType === schema.type;
                  return (
                    <button
                      key={schema.type}
                      onClick={() => setSelectedType(schema.type)}
                      className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-xs font-mono transition-all
                        ${active
                          ? "bg-bg-active text-text-primary border-r-2"
                          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                        }`}
                      style={{ borderRightColor: active ? schema.color : "transparent" }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 opacity-80"
                        style={{ backgroundColor: schema.color }}
                      />
                      <span className="truncate font-medium">{schema.label || schema.type}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-bg-border px-4 py-2 flex items-center justify-between">
        <p className="text-[10px] font-mono text-text-muted truncate flex-1" title={projectPath ?? ""}>
          {projectPath?.split(/[\\/]/).pop() ?? "—"}
        </p>
        <button
          onClick={() => setEditingSchema(true)}
          className={`text-text-muted hover:text-text-primary transition-colors ${editingSchema ? "text-blue-400" : ""}`}
          title="Gerenciar Tipos (Schemas)"
        >
          <Settings size={14} />
        </button>
      </div>
    </aside>
  );
}
