import { useState } from "react";
import { useStore } from "../store";
import { ALL_SCHEMAS, SCHEMA_MAP } from "../lib/schemas";
import { X, Plus, Save, FileCode, Trash2 } from "lucide-react";
import type { Schema, SchemaField } from "../types";

// Tipos de campo disponíveis para o usuário
const FIELD_TYPES = [
  "string", "int", "float", "bool", "color", "vector3",
  "file", "image", "array_string", "relation", "array_relation"
];

import { saveSchema, generateGDScript, loadSchemas } from "../lib/fs";

export function SchemaEditor() {
  const { setEditingSchema, projectPath, schemas, setSchemas } = useStore();
  
  // Lista de schemas ou "Novo Schema"
  const [selectedSchemaType, setSelectedSchemaType] = useState<string | null>(null);
  
  // Estado local do schema sendo editado
  const [draft, setDraft] = useState<Schema | null>(null);

  const handleSelectSchema = (type: string) => {
    const original = schemas.find(s => s.type === type);
    if (original) {
      setDraft(JSON.parse(JSON.stringify(original))); // Clone profundo para edição
      setSelectedSchemaType(type);
    }
  };

  const handleNewSchema = () => {
    const newSchema: Schema = {
      type: "NewType",
      label: "New Resource",
      emoji: "📦",
      color: "#ffffff",
      folder: "data/new_type",
      convention: "snake_case",
      fields: []
    };
    setDraft(newSchema);
    setSelectedSchemaType("new");
  };

  const handleSave = async () => {
    if (!draft || !projectPath) return;
    try {
      const path = await saveSchema(draft, projectPath);
      
      // Recarrega os schemas para atualizar a lista
      const loaded = await loadSchemas(projectPath);
      setSchemas(loaded);
      
      alert(`Schema salvo com sucesso!\n${path}`);
    } catch (e) {
      alert("Erro ao salvar schema: " + String(e));
    }
  };

  const handleGenerateGDScript = async () => {
    if (!draft || !projectPath) {
      alert("Selecione um projeto primeiro!");
      return;
    }
    try {
      const path = await generateGDScript(draft, projectPath);
      alert(`Script ${draft.type}.gd gerado com sucesso em:\n${path}`);
    } catch (e) {
      alert("Erro ao gerar script: " + String(e));
    }
  };

  return (
    <div className="flex w-full h-screen bg-bg-base text-text-primary">
      {/* Sidebar: Lista de tipos */}
      <div className="w-64 border-r border-bg-border flex flex-col">
        <div className="p-4 border-b border-bg-border flex justify-between items-center">
          <h2 className="font-bold text-sm">Schema Editor</h2>
          <button onClick={() => setEditingSchema(false)} title="Fechar Editor">
            <X size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={handleNewSchema}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono rounded hover:bg-bg-hover text-green-400"
          >
            <Plus size={14} /> NOVO TIPO
          </button>
          
          <hr className="border-bg-border my-2" />
          
          {schemas.map(s => (
            <button
              key={s.type}
              onClick={() => handleSelectSchema(s.type)}
              className={`w-full text-left px-3 py-1.5 text-xs font-mono rounded truncate
                ${selectedSchemaType === s.type ? "bg-bg-active text-text-primary" : "text-text-muted hover:bg-bg-hover"}
              `}
            >
              {s.emoji} {s.type}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!draft ? (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            Selecione um tipo para editar ou crie um novo.
          </div>
        ) : (
          <>
            {/* Header / Actions */}
            <div className="p-4 border-b border-bg-border flex justify-between items-center bg-bg-panel">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{draft.emoji}</span>
                <div>
                  <h1 className="font-bold text-lg">{draft.type}</h1>
                  <p className="text-xs text-text-muted">{draft.label}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateGDScript}
                  className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded text-xs hover:bg-blue-600/30 flex items-center gap-2"
                >
                  <FileCode size={14} /> Gerar .gd
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 font-bold flex items-center gap-2"
                >
                  <Save size={14} /> Salvar Schema
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Basic Info */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted border-b border-bg-border pb-1">
                  Metadados
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Class Name (Type)" value={draft.type} onChange={v => setDraft({...draft, type: v})} />
                  <FormInput label="Label (UI)" value={draft.label} onChange={v => setDraft({...draft, label: v})} />
                  <FormInput label="Folder" value={draft.folder} onChange={v => setDraft({...draft, folder: v})} />
                  <div className="flex gap-4">
                    <div className="w-20">
                      <EmojiInput value={draft.emoji} onChange={v => setDraft({...draft, emoji: v})} />
                    </div>
                    <div className="flex-1">
                      <FormInput label="Color (Hex)" type="color" value={draft.color} onChange={v => setDraft({...draft, color: v})} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Fields Editor */}
              <section className="space-y-4">
                <div className="flex justify-between items-end border-b border-bg-border pb-1">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">
                    Campos (Fields)
                  </h3>
                  <button
                    onClick={() => setDraft({
                      ...draft,
                      fields: [...draft.fields, { key: "new_field", label: "New Field", type: "string" }]
                    })}
                    className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Field
                  </button>
                </div>

                <div className="space-y-2">
                  {draft.fields.map((field, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-bg-panel rounded border border-bg-border group">
                      <div className="flex-1 grid grid-cols-12 gap-2">
                        {/* Key */}
                        <div className="col-span-3">
                          <label className="text-[10px] text-text-muted block mb-0.5">Key (Var Name)</label>
                          <input
                            className="w-full bg-bg-base border border-bg-border rounded px-2 py-1 text-xs font-mono"
                            value={field.key}
                            onChange={(e) => {
                              const newFields = [...draft.fields];
                              newFields[idx] = { ...field, key: e.target.value };
                              setDraft({ ...draft, fields: newFields });
                            }}
                          />
                        </div>

                        {/* Type */}
                        <div className="col-span-3">
                          <label className="text-[10px] text-text-muted block mb-0.5">Type</label>
                          <select
                            className="w-full bg-bg-base border border-bg-border rounded px-2 py-1 text-xs font-mono"
                            value={field.type}
                            onChange={(e) => {
                              const newFields = [...draft.fields];
                              newFields[idx] = { ...field, type: e.target.value as any };
                              setDraft({ ...draft, fields: newFields });
                            }}
                          >
                            {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>

                        {/* Label */}
                        <div className="col-span-3">
                          <label className="text-[10px] text-text-muted block mb-0.5">Label (UI)</label>
                          <input
                            className="w-full bg-bg-base border border-bg-border rounded px-2 py-1 text-xs"
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...draft.fields];
                              newFields[idx] = { ...field, label: e.target.value };
                              setDraft({ ...draft, fields: newFields });
                            }}
                          />
                        </div>

                        {/* Extra Options (simplified) */}
                        <div className="col-span-3">
                          <label className="text-[10px] text-text-muted block mb-0.5">Category/Group</label>
                          <input
                             className="w-full bg-bg-base border border-bg-border rounded px-2 py-1 text-xs"
                             value={field.group ?? ""}
                             placeholder="(Optional)"
                             onChange={(e) => {
                               const newFields = [...draft.fields];
                               newFields[idx] = { ...field, group: e.target.value };
                               setDraft({ ...draft, fields: newFields });
                             }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const newFields = draft.fields.filter((_, i) => i !== idx);
                          setDraft({ ...draft, fields: newFields });
                        }}
                        className="mt-5 text-text-muted hover:text-red-400 p-1"
                        title="Remover Campo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {draft.fields.length === 0 && (
                    <p className="text-center text-xs text-text-muted py-8 border border-dashed border-bg-border rounded">
                      Nenhum campo definido. Adicione variáveis ao seu recurso.
                    </p>
                  )}
                </div>
              </section>

            </div>
          </>
        )}
      </div>
    </div>
  );
}


function FormInput({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1 font-mono">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-panel border border-bg-border rounded px-3 py-1.5 text-sm focus:border-text-muted outline-none"
      />
    </div>
  );
}

function EmojiInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const presets = [
    "📦", "📝", "⚙️", "👤", "👾", "🤖", "💀", "👻", "👽",
    "⚔️", "🛡️", "🏹", "💣", "🔫", "🩸", 
    "🗝️", "💰", "💎", "📜", "🎒", "🧪",
    "🌲", "🏠", "🏰", "🌋", "☁️", "🌊",
    "🎵", "🔊", "💥", "✨", "💨", "🔥",
    "🔌", "🎮", "🎲", "❤️", "⭐", "⚡"
  ];

  return (
    <div className="relative">
      <label className="block text-xs text-text-secondary mb-1 font-mono">Emoji</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-bg-panel border border-bg-border rounded px-3 py-1.5 text-xl flex items-center justify-center hover:bg-bg-hover"
      >
        {value || "❓"}
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-bg-panel border border-bg-border rounded shadow-xl z-20 p-2 grid grid-cols-5 gap-1">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => { onChange(p); setOpen(false); }}
                className="text-xl hover:bg-bg-hover p-1 rounded"
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
