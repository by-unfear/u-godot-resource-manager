import { FolderOpen, Settings, RefreshCw } from "lucide-react";
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
        <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
          Resources
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerRefresh}
            title="Reescanear recursos"
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleChangeProject}
            title={projectPath ?? ""}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <FolderOpen size={14} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto py-2">
        {Object.entries(schemas.reduce((acc, schema: Schema) => {
          // Extrai a primeira pasta como categoria (ex: "data/player/..." -> "data")
          // Na verdade, vamos simplificar e usar uma lógica customizada ou "Custom"
          // Melhor: Se tiver definido em SCHEMA_CATEGORIES, usa de lá. Se não, joga em "Custom"
          
          let category = "Custom";
          
          // Tenta encontrar em categorias pré-definidas
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
          <div key={label} className="mb-1">
            <p className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-text-muted">
              {label}
            </p>
            {list.map((schema) => {
              const active = selectedType === schema.type;
              return (
                <button
                  key={schema.type}
                  onClick={() => setSelectedType(schema.type)}
                  className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-sm transition-all
                    ${active
                      ? "bg-bg-active text-text-primary"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                    }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: active ? schema.color : "#3a3a48" }}
                  />
                  <span className="truncate">{schema.label}</span>
                </button>
              );
            })}
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
