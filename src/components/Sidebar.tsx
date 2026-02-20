import { FolderOpen, Settings } from "lucide-react";
import { useStore } from "../store";
import { SCHEMA_CATEGORIES, SCHEMA_MAP } from "../lib/schemas";
import { pickDirectory } from "../lib/fs";

export function Sidebar() {
  const { selectedType, setSelectedType, setProjectPath, projectPath } = useStore();

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
        <button
          onClick={handleChangeProject}
          title={projectPath ?? ""}
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <FolderOpen size={14} />
        </button>
      </div>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto py-2">
        {SCHEMA_CATEGORIES.map((cat) => (
          <div key={cat.label} className="mb-1">
            <p className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-text-muted">
              {cat.label}
            </p>
            {cat.types.map((type) => {
              const schema = SCHEMA_MAP[type];
              if (!schema) return null;
              const active = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
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
      <div className="border-t border-bg-border px-4 py-2">
        <p className="text-[10px] font-mono text-text-muted truncate" title={projectPath ?? ""}>
          {projectPath?.split(/[\\/]/).pop() ?? "—"}
        </p>
      </div>
    </aside>
  );
}
