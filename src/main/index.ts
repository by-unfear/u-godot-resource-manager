import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import fs from "fs";
import { readdirSync, statSync } from "fs";

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0d0d0f",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
      webSecurity: false,
    },
  });

  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

// Lista recursiva de arquivos por extensão
ipcMain.handle("walk-dir", (_e, root: string, ext: string) => {
  const results: string[] = [];
  const clean = ext.replace(/^\./, "");
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    if (!fs.existsSync(dir)) continue;

    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (entry.startsWith(".") || entry === "node_modules") continue;
        
        const full = join(dir, entry);
        try {
          const stat = statSync(full);
          if (stat.isDirectory()) {
            stack.push(full);
          } else if (entry.endsWith(`.${clean}`)) {
            results.push(full);
          }
        } catch { /* erro ao ler stat */ }
      }
    } catch { /* erro ao ler dir */ }
  }
  return results.sort();
});

// Lê arquivo de texto
ipcMain.handle("read-file", (_e, path: string) => {
  return fs.readFileSync(path, "utf-8");
});

// Escreve arquivo (cria pastas intermediárias)
ipcMain.handle("write-file", (_e, path: string, content: string) => {
  fs.mkdirSync(require("path").dirname(path), { recursive: true });
  fs.writeFileSync(path, content, "utf-8");
});

// Remove arquivo
ipcMain.handle("delete-file", (_e, path: string) => {
  fs.unlinkSync(path);
});

// Verifica se path existe
ipcMain.handle("path-exists", (_e, path: string) => {
  return fs.existsSync(path);
});

// Dialog: abre pasta
ipcMain.handle("pick-directory", async (e) => {
  const win = BrowserWindow.fromWebContents(e.sender)!;
  const result = await dialog.showOpenDialog(win, { properties: ["openDirectory"] });
  return result.canceled ? null : result.filePaths[0];
});

// Dialog: abre arquivo com filtros
ipcMain.handle("pick-file", async (e, filters: { name: string; extensions: string[] }[]) => {
  const win = BrowserWindow.fromWebContents(e.sender)!;
  const result = await dialog.showOpenDialog(win, { properties: ["openFile"], filters });
  return result.canceled ? null : result.filePaths[0];
});

// Exporta .tres a partir de JSON
ipcMain.handle("export-tres", (_e, jsonStr: string, typeName: string, outputPath: string, enumMapsStr: string) => {
  const data = JSON.parse(jsonStr);
  const enums: Record<string, string[]> = JSON.parse(enumMapsStr || "{}");
  const lines: string[] = [
    `[gd_resource type="${typeName}" format=3]`,
    "",
    "[resource]",
  ];

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("_")) continue;
    lines.push(`${key} = ${toTresValue(key, value, enums)}`);
  }

  const content = lines.join("\n") + "\n";
  fs.mkdirSync(require("path").dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, "utf-8");
});

function toTresValue(key: string, value: unknown, enums: Record<string, string[]>): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (enums[key]) {
      const idx = enums[key].indexOf(value);
      return String(idx >= 0 ? idx : 0);
    }
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  if (Array.isArray(value)) {
    const items = value.map((v) => typeof v === "string" ? `"${v}"` : String(v));
    return `[${items.join(", ")}]`;
  }
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, number>;
    if ("x" in obj && "y" in obj && "z" in obj)
      return `Vector3(${obj.x}, ${obj.y}, ${obj.z})`;
    if ("r" in obj && "g" in obj && "b" in obj)
      return `Color(${obj.r}, ${obj.g}, ${obj.b}, ${(obj as Record<string, number>).a ?? 1})`;
    return "{}";
  }
  return String(value);
}
