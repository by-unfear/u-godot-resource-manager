import { useState, useEffect } from "react";
import { X, Plus, Save, FileCode, Trash2, ChevronDown, ChevronRight, Settings } from "lucide-react";
import { useStore } from "../store";
import { saveSchema, generateGDScript, loadSchemas } from "../lib/fs";
import { SCHEMA_CATEGORIES } from "../lib/schemas";
import type { Schema, SchemaField } from "../types";

// Tipos de campo disponíveis para o usuário
const FIELD_TYPES = [
  "string", "int", "float", "bool", "color", "vector3",
  "file", "image", "array_string", "relation", "array_relation"
];

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
      folder: "", // Default to resources
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
      
      // Atualiza o schema selecionado se necessário
      if (selectedSchemaType === "new") {
          setSelectedSchemaType(draft.type);
      }
      
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
    <div className="flex h-full w-full overflow-hidden bg-[#0d0d0f]">
      {/* Sidebar: Lista de tipos (Estilo Sidebar.tsx) */}
      <aside className="flex flex-col w-56 h-full border-r border-bg-border bg-bg-panel shrink-0">
        {/* Header Identico ao Sidebar.tsx */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border shrink-0">
          <h1 className="font-bold text-sm tracking-wide text-text-muted">SCHEMAS</h1>
          <div className="flex items-center gap-1">
            <button 
                onClick={() => setEditingSchema(false)} 
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                title="Fechar Editor"
            >
                <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
            {/* Botão Novo Tipo mais limpo */}
            <div className="px-2 mb-2">
                <button
                    onClick={handleNewSchema}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded hover:bg-bg-hover text-green-400 border border-transparent hover:border-bg-border transition-all
                        ${selectedSchemaType === "new" ? "bg-bg-active border-bg-border" : ""}`}
                >
                    <Plus size={14} /> Novo Tipo
                </button>
            </div>

            {/* Listagem de Schemas (Estilo resource list) */}
            {Object.entries(schemas.reduce((acc, schema) => {
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
                        {list.map(s => {
                            const active = selectedSchemaType === s.type;
                            return (
                                <button
                                    key={s.type}
                                    onClick={() => handleSelectSchema(s.type)}
                                    className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-xs font-mono transition-all
                                        ${active
                                        ? "bg-bg-active text-text-primary border-r-2 border-r-primary"
                                        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                                        }`}
                                    style={{ borderRightColor: active ? s.color : "transparent" }}
                                >
                                    <span 
                                        className="w-2 h-2 rounded-full shrink-0 opacity-80" 
                                        style={{ backgroundColor: s.color }} 
                                    />
                                    <span className="truncate font-medium">{s.type}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
      </aside>

      {/* Editor Area (Estilo ResourceForm.tsx) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bg-base">
        {!draft ? (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center space-y-2">
                <Settings size={48} className="mx-auto text-bg-border" />
                <p>Selecione um tipo para editar ou crie um novo.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Bar */}
            <div 
                className="flex items-center justify-between px-6 py-3 border-b border-bg-border bg-bg-panel shrink-0"
                style={{ borderTopColor: draft.color, borderTopWidth: 2 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{draft.emoji}</span>
                <div>
                  <h1 className="font-bold text-lg leading-none">{draft.type}</h1>
                  <p className="text-xs text-text-muted mt-0.5 font-mono">{draft.label}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateGDScript}
                  className="px-3 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded text-xs hover:bg-blue-600/20 flex items-center gap-2 transition-all"
                >
                  <FileCode size={14} /> Gerar Script
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                  <Save size={14} /> Salvar Schema
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              
              {/* Metadata Section */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted border-b border-bg-border pb-2">
                  Configurações do Tipo
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <FormInput 
                    label="Class Name (Type)" 
                    value={draft.type} 
                    onChange={v => setDraft({...draft, type: v})} 
                    placeholder="Ex: MyItem"
                  />
                  <FormInput 
                    label="Label (UI)" 
                    value={draft.label} 
                    onChange={v => setDraft({...draft, label: v})} 
                    placeholder="Ex: My Item"
                  />
                  <FormInput 
                    label="Resource Folder (ex: items/weapons)" 
                    value={draft.folder} 
                    onChange={v => setDraft({...draft, folder: v})} 
                    placeholder="Deixe vazio para usar 'resources/'"
                  />
                  <div className="flex gap-4 items-end">
                    <div className="w-20">
                      <EmojiInput value={draft.emoji} onChange={v => setDraft({...draft, emoji: v})} />
                    </div>
                    <div className="flex-1">
                      <FormInput label="Color (Hex)" type="color" value={draft.color} onChange={v => setDraft({...draft, color: v})} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Fields Section */}
              <section className="space-y-4">
                <div className="flex justify-between items-end border-b border-bg-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                    Propriedades (Campos)
                  </h3>
                  <button
                    onClick={() => setDraft({
                      ...draft,
                      fields: [...draft.fields, { key: "new_var", label: "New Variable", type: "string" }]
                    })}
                    className="px-2 py-1 bg-bg-active border border-bg-border rounded text-xs text-green-400 hover:text-green-300 hover:border-green-400/50 flex items-center gap-1 transition-all"
                  >
                    <Plus size={12} /> Add Field
                  </button>
                </div>

                <div className="space-y-2">
                  {draft.fields.map((field, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-bg-panel rounded border border-bg-border group hover:border-text-muted/30 transition-colors">
                      <div className="flex-1 grid grid-cols-12 gap-3">
                        {/* Key */}
                        <div className="col-span-3">
                          <label className="text-[10px] text-text-muted block mb-0.5 font-mono">Var Name</label>
                          <input
                            className="w-full bg-bg-base border border-bg-border rounded px-2 py-1.5 text-xs font-mono focus:border-text-secondary outline-none"
                            value={field.key}
                            placeholder="my_var"
                            onChange={(e) => {
                              const newFields = [...draft.fields];
                              newFields[idx] = { ...field, key: e.target.value };
                              setDraft({ ...draft, fields: newFields });
                            }}
                          />
                        </div>

                        {/* Type */}
                        <div className="col-span-3">
                          <label className="text-[10px] text-text-muted block mb-0.5 font-mono">Type</label>
                          <select
                            className="w-full bg-bg-base border border-bg-border rounded px-2 py-1.5 text-xs font-mono focus:border-text-secondary outline-none"
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
                          <label className="text-[10px] text-text-muted block mb-0.5 font-mono">Display Label</label>
                          <input
                            className="w-full bg-bg-base border border-bg-border rounded px-2 py-1.5 text-xs focus:border-text-secondary outline-none"
                            value={field.label}
                            placeholder="UI Label"
                            onChange={(e) => {
                              const newFields = [...draft.fields];
                              newFields[idx] = { ...field, label: e.target.value };
                              setDraft({ ...draft, fields: newFields });
                            }}
                          />
                        </div>

                        {/* Group */}
                        <div className="col-span-3">
                          <label className="text-[10px] text-text-muted block mb-0.5 font-mono">Category</label>
                          <input
                             className="w-full bg-bg-base border border-bg-border rounded px-2 py-1.5 text-xs focus:border-text-secondary outline-none"
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
                        className="mt-5 text-text-muted hover:text-red-400 p-1.5 rounded hover:bg-bg-base transition-colors"
                        title="Remove Field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {draft.fields.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-bg-border rounded-lg bg-bg-panel/50">
                      <p className="text-sm text-text-muted">Nenhum campo definido.</p>
                      <p className="text-xs text-text-secondary mt-1">Adicione variáveis como Vida, Dano, Textura, etc.</p>
                    </div>
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


function FormInput({ label, value, onChange, type = "text", placeholder }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1 font-mono">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-base border border-bg-border rounded px-3 py-2 text-sm focus:border-text-muted outline-none transition-colors"
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
        className="w-full bg-bg-base border border-bg-border rounded px-3 py-1.5 text-xl flex items-center justify-center hover:bg-bg-hover transition-colors h-[38px]"
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
