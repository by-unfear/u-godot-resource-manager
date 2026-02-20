import type { Schema, SchemaField, ResourceRecord } from "../types";

function fieldDefault(field: SchemaField): unknown {
  if (field.default !== undefined) return field.default;
  switch (field.type) {
    case "string":
    case "text":
    case "file":
    case "image":
    case "relation":
      return "";
    case "int":
    case "float":
      return field.min ?? 0;
    case "bool":
      return false;
    case "enum":
      return field.options?.[0] ?? "";
    case "color":
      return { r: 1, g: 1, b: 1, a: 1 };
    case "vector3":
      return { x: 0, y: 0, z: 0 };
    case "array_string":
    case "array_relation":
    case "inner_array":
      return [];
    case "dictionary":
      return {};
  }
}

export function buildDefault(
  schema: Schema,
  fileName: string,
  projectPath: string
): ResourceRecord {
  // Determine target folder relative to project root
  // If schema.folder is set, use it. Else default to "resources".
  // Clean up leading/trailing slashes.
  const relativeFolder = schema.folder ? schema.folder.replace(/^\/|\/$/g, "") : "resources";
  
  // JSON Path: .schemas/data/[relativeFolder]/[fileName].json
  const jsonPath = `${projectPath}/.schemas/data/${relativeFolder}/${fileName}.json`.replace(/\\/g, "/");

  const record: ResourceRecord = {
    _type: schema.type,
    _file: fileName,
    _path: jsonPath,
  };
  for (const field of schema.fields) {
    record[field.key] = fieldDefault(field);
  }
  return record;
}
