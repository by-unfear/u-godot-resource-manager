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
  exportTres: (json: string, type: string, output: string, enums: string) => Promise<void>;
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
  folder: string
): Promise<ResourceRecord[]> {
  const dir = `${projectPath}/${folder}`;
  const exists = await pathExists(dir);
  if (!exists) return [];

  const files = await walkDir(dir, "json");
  const records: ResourceRecord[] = [];
  for (const file of files) {
    try {
      const rec = await loadResource(file);
      if (rec._type === typeName) records.push(rec);
    } catch { /* arquivo corrompido */ }
  }
  return records;
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
export function toImageSrc(absolutePath: string): string {
  return absolutePath.startsWith("file://")
    ? absolutePath
    : `file:///${absolutePath.replace(/\\/g, "/")}`;
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
