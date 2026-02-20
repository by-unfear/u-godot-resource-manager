import type { Schema } from "../types";

// Import all schemas statically
import abilityData from "../schemas/ability_data.json";
import abilityEffectData from "../schemas/ability_effect_data.json";
import abilityLibraryData from "../schemas/ability_library_data.json";
import aiProfileData from "../schemas/ai_profile_data.json";
import audioLibraryData from "../schemas/audio_library_data.json";
import audioTrackData from "../schemas/audio_track_data.json";
import currencyData from "../schemas/currency_data.json";
import dialogueData from "../schemas/dialogue_data.json";
import effectData from "../schemas/effect_data.json";
import encounterData from "../schemas/encounter_data.json";
import entityData from "../schemas/entity_data.json";
import itemData from "../schemas/item_data.json";
import lootTableData from "../schemas/loot_table_data.json";
import metaProgressionData from "../schemas/meta_progression_data.json";
import modData from "../schemas/mod_data.json";
import movementPatternData from "../schemas/movement_pattern_data.json";
import objectiveData from "../schemas/objective_data.json";
import runModifierData from "../schemas/run_modifier_data.json";
import statusEffectData from "../schemas/status_effect_data.json";
import vendorData from "../schemas/vendor_data.json";
import weaponData from "../schemas/weapon_data.json";
import worldData from "../schemas/world_data.json";
import worldLibraryData from "../schemas/world_library_data.json";
import worldSystemEntry from "../schemas/world_system_entry.json";
import worldSystemsRegistryData from "../schemas/world_systems_registry_data.json";
import worldUiEntry from "../schemas/world_ui_entry.json";

export const ALL_SCHEMAS: Schema[] = [
  // Gameplay
  entityData,
  abilityData,
  abilityEffectData,
  abilityLibraryData,
  statusEffectData,
  modData,
  itemData,
  // Combat & AI
  weaponData,
  aiProfileData,
  movementPatternData,
  // Audio & VFX
  audioTrackData,
  audioLibraryData,
  effectData,
  // World
  worldData,
  worldLibraryData,
  worldSystemEntry,
  worldSystemsRegistryData,
  worldUiEntry,
  // Roguelike
  encounterData,
  lootTableData,
  runModifierData,
  metaProgressionData,
  objectiveData,
  // Economy & NPCs
  currencyData,
  vendorData,
  dialogueData,
] as Schema[];

export const SCHEMA_MAP: Record<string, Schema> = Object.fromEntries(
  ALL_SCHEMAS.map((s) => [s.type, s])
);

export function getSchema(type: string): Schema | undefined {
  return SCHEMA_MAP[type];
}

/** Retorna os enums de todos os campos (para o exportador .tres) */
export function getEnumMap(schema: Schema): Record<string, string[]> {
  const result: Record<string, string[]> = {};
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
