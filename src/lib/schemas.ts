import type { Schema } from "../types";

// Dynamic schema loading is now preferred.
// This file serves as a fallback or type reference.

export const ALL_SCHEMAS: Schema[] = [];

export const SCHEMA_MAP: Record<string, Schema> = {};

export function getSchema(type: string): Schema | undefined {
  return SCHEMA_MAP[type];
}

/** Retorna os enums de todos os campos (para o exportador .tres) */
export function getEnumMap(schema: Schema): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  if (!schema.fields) return result;
  for (const field of schema.fields) {
    if (field.type === "enum" && field.options) {
      result[field.key] = field.options;
    }
  }
  return result;
}

/** Agrupa schemas por categoria para exibição na sidebar */
export const SCHEMA_CATEGORIES: { label: string; types: string[] }[] = [
  {
    label: "Gameplay",
    types: ["EntityData", "AbilityData", "AbilityEffectData", "AbilityLibraryData", "StatusEffectData", "ModData", "ItemData"],
  },
  {
    label: "Combat & AI",
    types: ["WeaponData", "AIProfileData", "MovementPatternData"],
  },
  {
    label: "Audio & VFX",
    types: ["AudioTrackData", "AudioLibraryData", "EffectData"],
  },
  {
    label: "World",
    types: ["WorldData", "WorldLibraryData", "WorldSystemEntry", "WorldSystemsRegistryData", "WorldUIEntry"],
  },
  {
    label: "Roguelike",
    types: ["EncounterData", "LootTableData", "RunModifierData", "MetaProgressionData", "ObjectiveData"],
  },
  {
    label: "Economy & NPCs",
    types: ["CurrencyData", "VendorData", "DialogueData"],
  },
];
