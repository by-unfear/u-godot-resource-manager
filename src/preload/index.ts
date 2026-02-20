import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  walkDir: (root: string, ext: string) =>
    ipcRenderer.invoke("walk-dir", root, ext),

  readFile: (path: string) =>
    ipcRenderer.invoke("read-file", path),

  writeFile: (path: string, content: string) =>
    ipcRenderer.invoke("write-file", path, content),

  deleteFile: (path: string) =>
    ipcRenderer.invoke("delete-file", path),

  pathExists: (path: string) =>
    ipcRenderer.invoke("path-exists", path),

  pickDirectory: () =>
    ipcRenderer.invoke("pick-directory"),

  pickFile: (filters: { name: string; extensions: string[] }[]) =>
    ipcRenderer.invoke("pick-file", filters),

  exportTres: (json: string, type: string, output: string, enums: string) =>
    ipcRenderer.invoke("export-tres", json, type, output, enums),

  saveSchema: (schema: any, projectPath: string) =>
    ipcRenderer.invoke("save-schema", schema, projectPath),

  loadSchemas: (projectPath: string) =>
    ipcRenderer.invoke("load-schemas", projectPath),

  generateGDScript: (schema: any, projectPath: string) =>
    ipcRenderer.invoke("generate-gdscript", schema, projectPath),
});
