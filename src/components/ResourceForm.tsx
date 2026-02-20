import { useEffect, useState } from "react";
import { Save, Download, ChevronDown, ChevronRight } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { useStore } from "../store";
import { getSchema, getEnumMap } from "../lib/schemas";
import { loadResource, saveResource, exportTres, basename, stripExt } from "../lib/fs";
import { FieldRenderer } from "./fields/FieldRenderer";
import type { ResourceRecord } from "../types";

export function ResourceForm() {
  const selectedFile = useStore((s) => s.selectedFile);
  const selectedType = useStore((s) => s.selectedType);
  const projectPath = useStore((s) => s.projectPath);
  const schemas = useStore((s) => s.schemas);
  const upsertResource = useStore((s) => s.upsertResource);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportPath, setExportPath] = useState("");

  const schema = schemas.find(s => s.type === selectedType) ?? null;
  const methods = useForm<ResourceRecord>();
  const { handleSubmit, reset, watch } = methods;

  // Load record when selectedFile changes
  useEffect(() => {
    if (!selectedFile) return;
    setLoading(true);
    loadResource(selectedFile)
      .then((rec) => {
        reset(rec as Record<string, unknown>);
        // Build default export path
        if (projectPath && schema) {
          const name = rec._file || stripExt(basename(selectedFile));
          const folder = schema.folder ? schema.folder.replace(/^\/|\/$/g, "") : "resources";
          const fullPath = `${projectPath}/${folder}/${name}.tres`.replace(/\\/g, "/");
          setExportPath(fullPath);
        }
      })
      .catch((err) => {
        console.error(err);
        // Fallback or error state could be handled here
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedFile]);

  const onSave = handleSubmit(async (data) => {
    if (!selectedFile) return;
    setSaving(true);
    const record = { ...data, _path: selectedFile } as ResourceRecord;
    await saveResource(record);
    upsertResource(record);
    setSaving(false);
  });

  const onExport = handleSubmit(async (data) => {
    if (!selectedFile || !schema) return;
    setExporting(true);
    const record = { ...data, _path: selectedFile } as ResourceRecord;
    const enumMap = getEnumMap(schema);
    await exportTres(record, enumMap, exportPath);
    setExporting(false);
  });

  if (!schema || !selectedFile) return null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-bg-panel text-text-muted font-mono text-xs">
        Carregando...
      </div>
    );
  }

  // Group fields
  const grouped: Record<string, typeof schema.fields> = {};
  const ungrouped: typeof schema.fields = [];

  for (const field of schema.fields) {
    if (field.group) {
      grouped[field.group] = [...(grouped[field.group] ?? []), field];
    } else {
      ungrouped.push(field);
    }
  }

  const fileName = watch("_file") as string || stripExt(basename(selectedFile));

  return (
    <FormProvider {...methods}>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b border-bg-border bg-bg-panel shrink-0"
          style={{ borderTopColor: schema.color, borderTopWidth: 2 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{schema.emoji}</span>
            <div>
              <h2 className="text-sm font-semibold text-text-primary leading-none">
                {fileName}
              </h2>
              <p className="text-xs font-mono text-text-muted mt-0.5">
                {schema.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export path input */}
            <input
              value={exportPath}
              onChange={(e) => setExportPath(e.target.value)}
              className="w-72 bg-bg-base border border-bg-border rounded px-2 py-1.5
                text-[11px] font-mono text-text-muted focus:outline-none focus:border-text-muted"
              placeholder="path/to/output.tres"
            />
            <button
              onClick={onExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-bg-border
                text-xs text-text-secondary hover:text-text-primary hover:border-text-muted transition-all"
            >
              <Download size={13} />
              {exporting ? "Exportando..." : "Export .tres"}
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium
                text-white transition-all"
              style={{ backgroundColor: schema.color }}
            >
              <Save size={13} />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

        {/* Form body */}
        <form
          onSubmit={onSave}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
        >
          {/* Ungrouped fields */}
          {ungrouped.length > 0 && (
            <div className="space-y-3">
              {ungrouped.map((field) => (
                <FieldRenderer key={field.key} field={field} />
              ))}
            </div>
          )}

          {/* Grouped fields */}
          {Object.entries(grouped).map(([group, fields]) => {
            const isCollapsed = collapsed[group];
            return (
              <div key={group} className="border border-bg-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [group]: !c[group] }))}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-bg-active
                    text-xs font-mono uppercase tracking-widest text-text-secondary
                    hover:bg-bg-hover transition-colors text-left"
                >
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  {group}
                </button>
                {!isCollapsed && (
                  <div className="px-4 py-3 space-y-3">
                    {fields.map((field) => (
                      <FieldRenderer key={field.key} field={field} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </form>
      </div>
    </FormProvider>
  );
}
