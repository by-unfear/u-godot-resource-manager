import type { ResourceRecord } from "../types";

// window.api é exposto pelo preload.ts via contextBridge
const api = (window as unknown as { api: typeof import("../../electron/preload") extends never ? never : {
  walkDir: (root: string, ext: string) => Promise<string[]>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  pathExists: (path: string) => Promise<boolean>;
  pickDirectory: () => Promise<string | null>;
  pickFile: (filters: { name: string; extensions: string[] }[]) => Promise<string | null>;
  buildJsonPath: (projectPath: string, folder: string, fileName: string) => string;
  saveSchema: (schema: any, projectPath: string) => Promise<string>;
  loadSchemas: (projectPath: string) => Promise<any[]>;
  generateGDScript: (schema: any, projectPath: string) => Promise<string>;
}}).api;

// ─── Directory ─────────────────────────────────────────────────────────────────

export async function pickDirectory(): Promise<string | null> {
  return api.pickDirectory();
}

export async function pickFile(filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
  return api.pickFile(filters ?? []);
}

export async function walkDir(root: string, ext: string): Promise<string[]> {
  return api.walkDir(root, ext);
}

// ─── JSON Resources ────────────────────────────────────────────────────────────

export async function loadResource(path: string): Promise<ResourceRecord> {
  const raw = await api.readFile(path);
  return JSON.parse(raw) as ResourceRecord;
}

export async function saveResource(record: ResourceRecord): Promise<void> {
  await api.writeFile(record._path, JSON.stringify(record, null, 2));
}

export async function deleteResource(path: string): Promise<void> {
  await api.deleteFile(path);
}

export async function pathExists(path: string): Promise<boolean> {
  return api.pathExists(path);
}

export async function loadAllOfType(
  projectPath: string,
  typeName: string,
  _folder?: string
): Promise<ResourceRecord[]> {
  // Agora escaneia recursivamente a partir da RAIZ do projeto
  // A pasta definida no schema (_folder) será usada apenas como sugestão para NOVOS arquivos
  const exists = await pathExists(projectPath);
  if (!exists) return [];

  const files = await walkDir(projectPath, "json");
  const records: ResourceRecord[] = [];
  
  for (const file of files) {
    try {
      const rec = await loadResource(file);
      if (rec._type === typeName) {
        // Atualiza o _path caso tenha movido o arquivo externamente
        if (rec._path !== file) rec._path = file;
        records.push(rec);
      }
    } catch { /* arquivo corrompido ou JSON inválido */ }
  }
  return records;
}

export function absoluteToRes(absolutePath: string, projectPath: string | null): string {
  if (!projectPath) return absolutePath;
  
  // Normaliza barras para /
  const abs = absolutePath.replace(/\\/g, "/");
  const root = projectPath.replace(/\\/g, "/");
  
  if (abs.startsWith(root)) {
    // Remove a raiz e adiciona res://
    let rel = abs.substring(root.length);
    if (rel.startsWith("/")) rel = rel.substring(1);
    return `res://${rel}`;
  }
  
  return absolutePath; // Fora do projeto
}

// ─── .tres Export ──────────────────────────────────────────────────────────────

export async function exportTres(
  record: ResourceRecord,
  enumMap: Record<string, string[]>,
  outputPath: string
): Promise<void> {
  const { _type, _file, _path, ...data } = record;
  await api.exportTres(
    JSON.stringify(data),
    _type,
    outputPath,
    JSON.stringify(enumMap)
  );
}

// ─── Image Preview ────────────────────────────────────────────────────────────

// No Electron, paths absolutos funcionam direto com o prefixo file://
export function toImageSrc(path: string, projectPath?: string | null): string {
  // Converter tudo para barras normais primeiro
  let abs = path.replace(/\\/g, "/");

  if (path.startsWith("res://") && projectPath) {
    const rel = path.substring(6);
    // Concatena e normaliza barras duplas
    const rawAbs = `${projectPath}/${rel}`.replace(/\\/g, "/").replace(/\/+/g, "/");
    return `file:///${encodeURI(rawAbs)}`;
  }

  // Se já for file:// retorna, senão assume absoluto
  return abs.startsWith("file://")
    ? abs
    : `file:///${encodeURI(abs)}`;
}

// ─── Path Helpers ──────────────────────────────────────────────────────────────

export function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

export function stripExt(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

export function buildJsonPath(
  projectPath: string,
  folder: string,
  fileName: string
): string {
  const sep = projectPath.includes("\\") ? "\\" : "/";
  const clean = fileName.endsWith(".json") ? fileName : `${fileName}.json`;
  return [projectPath, folder, clean].join(sep);
}

// ─── Schema Export ─────────────────────────────────────────────────────────────

export async function saveSchema(schema: any, projectPath: string): Promise<string> {
  return typeof api.saveSchema === "function" 
    ? await api.saveSchema(schema, projectPath)
    : Promise.reject("API saveSchema not available");
}

export async function loadSchemas(projectPath: string): Promise<any[]> {
  return typeof api.loadSchemas === "function"
    ? await api.loadSchemas(projectPath)
    : [];
}

export async function generateGDScript(schema: any, projectPath: string): Promise<string> {
  return typeof api.generateGDScript === "function"
    ? await api.generateGDScript(schema, projectPath)
    : Promise.reject("API generateGDScript not available");
}
