// ─── Schema Types ──────────────────────────────────────────────────────────────

export type FieldType =
  | "string"
  | "text"
  | "int"
  | "float"
  | "bool"
  | "enum"
  | "color"
  | "vector3"
  | "file"
  | "image"
  | "array_string"
  | "relation"        // picker de ID de outro resource
  | "array_relation"  // array de IDs de outro resource
  | "dictionary"
  | "inner_array";    // array de inner resources (Entry, Line, etc.)

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  default?: unknown;
  hint?: string;
  group?: string;
  // number
  min?: number;
  max?: number;
  step?: number;
  // enum
  options?: string[];
  // file
  filter?: string;
  // relation
  resource_type?: string;
  // inner_array
  inner_fields?: SchemaField[];
  inner_label?: string; // label para o botão "Add X"
}

export interface SchemaGroup {
  label: string;
  fields: string[]; // keys
}

export interface Schema {
  type: string;        // GDScript class_name
  label: string;       // Human-readable
  emoji: string;
  color: string;       // hex accent
  folder: string;      // default subfolder dentro de resources/
  convention: string;  // naming convention
  fields: SchemaField[];
  groups?: SchemaGroup[];
}

// ─── Resource Data ─────────────────────────────────────────────────────────────

export interface ResourceRecord {
  _type: string;
  _file: string;  // nome sem extensão
  _path: string;  // caminho absoluto do .json
  [key: string]: unknown;
}

// ─── App State ─────────────────────────────────────────────────────────────────

export interface AppStore {
  projectPath: string | null;
  selectedType: string | null;
  selectedFile: string | null;
  resources: Record<string, ResourceRecord[]>; // type → list
  setProjectPath: (path: string) => void;
  setSelectedType: (type: string) => void;
  setSelectedFile: (path: string | null) => void;
  setResources: (type: string, list: ResourceRecord[]) => void;
  upsertResource: (record: ResourceRecord) => void;
  removeResource: (type: string, path: string) => void;
}
