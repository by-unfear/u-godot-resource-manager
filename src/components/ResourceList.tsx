import { useEffect, useState } from "react";
import { Plus, Trash2, FileJson, X } from "lucide-react";
import { useStore } from "../store";
import { getSchema } from "../lib/schemas";
import { loadAllOfType, deleteResource, saveResource, basename, stripExt } from "../lib/fs";
import { buildDefault } from "../lib/defaults";

export function ResourceList() {
  const {
    projectPath, selectedType, selectedFile,
    setSelectedFile, resources, setResources,
    upsertResource, removeResource, refreshKey,
  } = useStore();

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = selectedType ? getSchema(selectedType) : null;
  const list = selectedType ? (resources[selectedType] ?? []) : [];

  // Load on type change
  useEffect(() => {
    if (!projectPath || !selectedType || !schema) return;
    setLoading(true);
    loadAllOfType(projectPath, selectedType, schema.folder)
      .then((recs) => setResources(selectedType, recs))
      .finally(() => setLoading(false));
  }, [selectedType, projectPath, refreshKey]);

  const handleCreate = async () => {
    if (!schema || !projectPath || !newName.trim()) return;
    const fileName = newName.trim().toLowerCase().replace(/\s+/g, "-");
    const record = buildDefault(schema, fileName, projectPath);
    await saveResource(record);
    upsertResource(record);
    setSelectedFile(record._path);
    setNewName("");
    setCreating(false);
  };

  const handleDelete = async (path: string) => {
    if (!selectedType) return;
    const ok = window.confirm("Deletar este resource?");
    if (!ok) return;
    await deleteResource(path);
    removeResource(selectedType, path);
    if (selectedFile === path) setSelectedFile(null);
  };

  if (!schema) return null;

  return (
    <div className="flex flex-col w-64 h-screen border-r border-bg-border bg-bg-panel shrink-0">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-bg-border"
        style={{ borderTopColor: schema.color, borderTopWidth: 2 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{schema.emoji}</span>
          <span className="text-sm font-medium text-text-primary">{schema.label}</span>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="text-text-muted hover:text-text-primary transition-colors"
          title="Novo resource"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* New resource input */}
      {creating && (
        <div className="px-3 py-2 border-b border-bg-border bg-bg-active">
          <div className="flex gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setCreating(false);
              }}
              placeholder={`ex: meu-${schema.type.toLowerCase()}`}
              className="flex-1 bg-bg-base border border-bg-border rounded px-2 py-1
                text-xs font-mono text-text-primary placeholder:text-text-muted
                focus:outline-none focus:border-text-muted"
            />
            <button
              onClick={handleCreate}
              className="px-2 py-1 rounded bg-bg-border text-text-primary text-xs hover:bg-bg-hover"
              title="Criar"
            >
              ✓
            </button>
            <button
              onClick={() => { setCreating(false); setNewName(""); }}
              className="px-2 py-1 rounded text-text-muted hover:text-text-primary transition-colors"
              title="Cancelar"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[10px] text-text-muted font-mono mt-1">
            {schema.convention}
          </p>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading && (
          <p className="px-4 py-3 text-xs text-text-muted font-mono">Carregando...</p>
        )}
        {!loading && list.length === 0 && (
          <p className="px-4 py-3 text-xs text-text-muted font-mono">
            Nenhum resource encontrado
          </p>
        )}
        {list.map((rec) => {
          const name = rec._file || stripExt(basename(rec._path));
          const active = selectedFile === rec._path;
          return (
            <div
              key={rec._path}
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-all
                ${active ? "bg-bg-active" : "hover:bg-bg-hover"}`}
              onClick={() => setSelectedFile(rec._path)}
            >
              <FileJson size={13} className="text-text-muted shrink-0" />
              <span className={`flex-1 text-xs font-mono truncate
                ${active ? "text-text-primary" : "text-text-secondary"}`}>
                {name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(rec._path); }}
                className="opacity-0 group-hover:opacity-100 text-text-muted
                  hover:text-red-400 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer count */}
      <div className="border-t border-bg-border px-4 py-2">
        <p className="text-[10px] font-mono text-text-muted">
          {list.length} resource{list.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
