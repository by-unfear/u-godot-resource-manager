# Godot Resource Manager

Editor desktop (Electron + Vite + React) para criar e gerenciar os `.json` de dados do seu projeto Godot.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- npm 9+

## Instalação

```cmd
npm install
```

## Desenvolvimento

```cmd
npm run dev
```

## Build

```cmd
npm run build
```

---

## Estrutura do projeto

```
electron/
  main.ts       → processo principal, handlers de arquivo e dialog
  preload.ts    → expõe API para o renderer via contextBridge

src/
  lib/
    fs.ts       → funções de arquivo (usa window.api do preload)
    schemas.ts  → carrega e indexa todos os schemas
    defaults.ts → gera record padrão a partir do schema
  schemas/      → 26 arquivos JSON, um por resource
  components/   → React UI
  types.ts      → tipos compartilhados
  store.ts      → estado global (Zustand)
```

## Como adicionar um novo resource

1. Crie `src/schemas/meu_resource.json`
2. Importe em `src/lib/schemas.ts`
3. Adicione na categoria em `SCHEMA_CATEGORIES`
4. Crie o `.gd` correspondente no Godot

## Formato do schema

```jsonc
{
  "type": "MeuData",
  "label": "Meu Resource",
  "emoji": "⭐",
  "color": "#ff6b6b",
  "folder": "resources/meu",
  "convention": "nome-meu.json",
  "fields": [
    { "key": "nome", "label": "Nome", "type": "string" },
    { "key": "valor", "label": "Valor", "type": "float", "default": 1.0 },
    { "key": "tipo", "label": "Tipo", "type": "enum", "options": ["A", "B"] },
    { "key": "cena", "label": "Cena", "type": "file", "filter": "*.tscn" },
    { "key": "icon", "label": "Ícone", "type": "image" },
    { "key": "tags", "label": "Tags", "type": "array_string" },
    { "key": "speed", "label": "Speed", "type": "float", "group": "Movement" }
  ]
}
```

## Tipos de campo disponíveis

| type | Descrição |
|---|---|
| `string` | Input de texto |
| `text` | Textarea |
| `int` | Número inteiro |
| `float` | Número decimal |
| `bool` | Checkbox |
| `enum` | Select com opções fixas |
| `file` | Path com file picker nativo (filtrado) |
| `image` | Path com preview da imagem |
| `color` | Color picker → `{r,g,b,a}` |
| `vector3` | Três inputs XYZ |
| `array_string` | Lista de strings editável |
| `relation` | Dropdown de IDs de outro resource |
| `inner_array` | Array de sub-objetos (Entry, Line, etc.) |
| `dictionary` | Textarea JSON livre |
