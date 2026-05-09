import fs from "fs";
import path from "path";

export interface Character {
  name: string;
  base_id: string;
  url: string;
  image: string;
  power: number;
  description: string;
  combat_type: number;
  gear_levels: Array<{
    tier: number;
    gear: string[];
  }>;
  alignment?: string;
  role?: string;
  category?: string[];
}

export interface Ability {
  base_id: string;
  ability_id: string;
  name: string;
  image: string;
  url: string;
  tier_max: number;
  is_zeta: boolean;
  is_omega: boolean;
  is_omicron: boolean;
  is_ultimate: boolean;
  description: string;
  combat_type: number;
  omicron_mode: number;
  type: number;
  character_base_id: string;
  ship_base_id: string | null;
  omicron_battle_types: string[];
}

export interface GearItem {
  id: string;
  name: string;
  rarity: string;
  recipe?: Array<{
    id: string;
    qty: number;
  }>;
}

export interface Unit {
  base_id: string;
  name: string;
  description: string;
  combatType: number;
  alignment: string;
  role: string;
  categories: string[];
}

let charactersCache: Character[] | null = null;
let abilitiesCache: Ability[] | null = null;
let gearsCache: GearItem[] | null = null;
let unitsCache: Unit[] | null = null;

const getDataPath = (filename: string): string => {
  return path.join(process.cwd(), "public", "data", filename);
};

const loadJSON = <T>(filename: string): T | null => {
  try {
    const filePath = getDataPath(filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return null;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
};

export const loadCharacters = (): Character[] => {
  if (charactersCache) return charactersCache;
  const data = loadJSON<Character[]>("characters.json");
  charactersCache = data || [];
  return charactersCache;
};

export const loadAbilities = (): Ability[] => {
  if (abilitiesCache) return abilitiesCache;
  const data = loadJSON<Ability[]>("abilities.json");
  abilitiesCache = data || [];
  return abilitiesCache;
};

export const loadGears = (): GearItem[] => {
  if (gearsCache) return gearsCache;
  const data = loadJSON<GearItem[]>("gear.json");
  gearsCache = data || [];
  return gearsCache;
};

export const loadUnits = (): Unit[] => {
  if (unitsCache) return unitsCache;
  const data = loadJSON<Unit[]>("units.json");
  unitsCache = data || [];
  return unitsCache;
};

export const findCharacterByName = (name: string): Character | undefined => {
  const characters = loadCharacters();
  const normalizedSearch = name.toLowerCase().trim();
  
  return characters.find(char => 
    char.name.toLowerCase().includes(normalizedSearch) ||
    char.base_id.toLowerCase().includes(normalizedSearch)
  );
};

export const findCharacterById = (id: string): Character | undefined => {
  const characters = loadCharacters();
  return characters.find(char => char.base_id === id);
};

export const getCharacterAbilities = (characterBaseId: string): Ability[] => {
  const abilities = loadAbilities();
  return abilities.filter(ability => ability.character_base_id === characterBaseId);
};

export const getCharacterZetas = (characterBaseId: string): Ability[] => {
  return getCharacterAbilities(characterBaseId).filter(ability => ability.is_zeta);
};

export const getCharacterOmicrons = (characterBaseId: string): Ability[] => {
  return getCharacterAbilities(characterBaseId).filter(ability => ability.is_omicron);
};

export const searchCharacters = (query: string): Character[] => {
  const characters = loadCharacters();
  const normalizedQuery = query.toLowerCase().trim();
  
  return characters.filter(char =>
    char.name.toLowerCase().includes(normalizedQuery) ||
    char.base_id.toLowerCase().includes(normalizedQuery) ||
    char.description.toLowerCase().includes(normalizedQuery)
  );
};

export const getAllCharactersByCategory = (category: string): Character[] => {
  const units = loadUnits();
  const categoryUnits = units.filter(unit => 
    unit.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
  );
  
  const characters = loadCharacters();
  return characters.filter(char => 
    categoryUnits.some(unit => unit.base_id === char.base_id)
  );
};

export const getAbilityByName = (abilityName: string): Ability | undefined => {
  const abilities = loadAbilities();
  const normalized = abilityName.toLowerCase().trim();
  
  return abilities.find(ability => 
    ability.name.toLowerCase().includes(normalized) ||
    ability.base_id.toLowerCase().includes(normalized)
  );
};
