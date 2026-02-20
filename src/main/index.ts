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

// ─── Schema & GDScript Generation ─────────────────────────────────────────────

ipcMain.handle("save-schema", (_e, schema: any, projectPath: string) => {
  if (!projectPath) throw new Error("Caminho do projeto não definido.");
  
  const fileName = `${schema.type.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()}.json`;
  
  // Salva no ProjectPath/schemas
  const schemaDir = join(projectPath, "schemas");
  if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir, { recursive: true });
  }

  const schemaPath = join(schemaDir, fileName);
  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), "utf-8");
  return schemaPath;
});

ipcMain.handle("load-schemas", (_e, projectPath: string) => {
  if (!projectPath || !fs.existsSync(projectPath)) return [];
  
  const schemaDir = join(projectPath, "schemas");
  // Se a pasta schemas não existe, retornamos array vazio (ou poderíamos copiar os defaults)
  if (!fs.existsSync(schemaDir)) return [];

  const results: any[] = [];
  try {
      const files = readdirSync(schemaDir);
      for (const file of files) {
          if (!file.endsWith(".json")) continue;
          try {
              const content = fs.readFileSync(join(schemaDir, file), "utf-8");
              const json = JSON.parse(content);
              // Pequena validação
              if (json.type && json.fields) {
                  results.push(json);
              }
          } catch (e) {
              console.error(`Erro ao ler schema ${file}:`, e);
          }
      }
  } catch (e) {
      console.error("Erro ao listar schemas:", e);
  }
  return results;
});

ipcMain.handle("generate-gdscript", (_e, schema: any, projectPath: string) => {
  if (!projectPath) throw new Error("Caminho do projeto não definido.");

  const className = schema.type;
  const fileName = className.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase() + ".gd";
  
  // Define onde salvar o .gd (no root ou script_templates? Por enquanto na raiz ou pasta do recurso)
  // Vamos salvar na pasta 'src' ou 'scripts' se existir, senão na raiz
  let targetDir = join(projectPath, "src/resources");
  if (!fs.existsSync(targetDir)) {
      targetDir = join(projectPath, "resources"); 
      if (!fs.existsSync(targetDir)) targetDir = projectPath;
  }
  
  const targetPath = join(targetDir, fileName);

  const lines = [
    `class_name ${className}`,
    "extends Resource",
    "",
    "## Auto-generated by Godot Resource Manager",
    ""
  ];

  // Agrupar campos
  const groups: Record<string, any[]> = {};
  const ungrouped: any[] = [];

  for (const field of schema.fields) {
    if (field.group) {
      groups[field.group] = [...(groups[field.group] || []), field];
    } else {
      ungrouped.push(field);
    }
  }

  const addField = (f: any) => {
    let typeStr = "";
    let defaultStr = "";

    switch (f.type) {
      case "string": typeStr = "String"; defaultStr = '""'; break;
      case "text": typeStr = "String"; defaultStr = '""'; break; // Multiline é hint
      case "int": typeStr = "int"; defaultStr = "0"; break;
      case "float": typeStr = "float"; defaultStr = "0.0"; break;
      case "bool": typeStr = "bool"; defaultStr = "false"; break;
      case "color": typeStr = "Color"; defaultStr = "Color.WHITE"; break;
      case "vector3": typeStr = "Vector3"; defaultStr = "Vector3.ZERO"; break;
      case "file": typeStr = "String"; defaultStr = '""'; break; // @export_file
      case "image": typeStr = "Texture2D"; defaultStr = "null"; break;
      case "array_string": typeStr = "Array[String]"; defaultStr = "[]"; break;
      case "relation": typeStr = "Resource"; defaultStr = "null"; break; // Poderia ser tipado
      case "array_relation": typeStr = "Array[Resource]"; defaultStr = "[]"; break;
      case "enum": 
        typeStr = "int"; // Enums são ints
        // TODO: Gerar enum definition se necessário
        defaultStr = "0";
        break;
      default: typeStr = "String"; defaultStr = '""';
    }

    // Hint Strings
    let exportHint = "@export";
    if (f.type === "text") exportHint = "@export_multiline";
    if (f.type === "file") exportHint = `@export_file("${f.filter || "*.*"}")`;
    if (f.type === "image") exportHint = "@export_file(\"*.png\", \"*.jpg\", \"*.webp\")";
    if (f.type === "enum" && f.options) {
      exportHint = `@export_enum("${f.options.join('", "')}")`;
    }
    if (f.hint) {
        lines.push(`## ${f.hint}`);
    }

    lines.push(`${exportHint} var ${f.key}: ${typeStr} = ${defaultStr}`);
  };

  // 1. Ungrouped
  ungrouped.forEach(addField);

  // 2. Grouped
  for (const [groupName, fields] of Object.entries(groups)) {
    lines.push("");
    lines.push(`@export_group("${groupName}")`);
    fields.forEach(addField);
  }

  fs.writeFileSync(targetPath, lines.join("\n"), "utf-8");
  return targetPath;
});
