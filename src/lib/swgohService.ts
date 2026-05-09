import { Character, Ability } from "./dataLoader";

interface SwgohCharacterData {
  name: string;
  baseId: string;
  rarity: number;
  level: number;
  gear: number;
  power: number;
  stats: {
    health: number;
    protection: number;
    speed: number;
    attack: number;
    armor: number;
    resistance: number;
  };
  abilities: string[];
  description: string;
  category: string;
  faction: string;
}

export const parseSwgohUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Извлекаем base_id из URL вроде swgoh.gg/characters/...
    const match = pathname.match(/\/([a-zA-Z0-9_-]+)\/?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

export const buildSwgohGgUrl = (baseId: string): string => {
  return `https://swgoh.gg/characters/${baseId}/`;
};

export const formatCharacterDescription = (
  character: Character,
  abilities: Ability[]
): string => {
  const zetas = abilities.filter(a => a.is_zeta);
  const omicrons = abilities.filter(a => a.is_omicron);
  const ultimate = abilities.find(a => a.is_ultimate);

  let description = `**${character.name}**\n`;
  description += `ID: \`${character.base_id}\`\n`;
  description += `Мощь: ${character.power}\n`;
  description += `Описание: ${character.description}\n\n`;

  if (zetas.length > 0) {
    description += `**Дзеты (${zetas.length}):**\n`;
    zetas.forEach(z => {
      description += `- ${z.name}: ${z.description.substring(0, 100)}...\n`;
    });
    description += "\n";
  }

  if (omicrons.length > 0) {
    description += `**Омикроны (${omicrons.length}):**\n`;
    omicrons.forEach(o => {
      description += `- ${o.name}\n`;
    });
    description += "\n";
  }

  if (ultimate) {
    description += `**Ультимат:**\n${ultimate.name}\n`;
  }

  return description;
};

export const formatAbilityInfo = (ability: Ability): string => {
  let info = `**${ability.name}**\n`;
  
  if (ability.is_zeta) info += "🟡 **Дзета**\n";
  if (ability.is_omicron) info += "🔴 **Омикрон**\n";
  if (ability.is_ultimate) info += "⭐ **Ультимат**\n";
  
  info += `\n${ability.description}\n`;
  info += `\nТип: ${ability.type} | Боевой тип: ${ability.combat_type}`;

  return info;
};

/**
 * Анализирует запрос пользователя и определяет тип поиска
 */
export const analyzeQuery = (query: string): {
  type: "character" | "ability" | "team" | "gear" | "unknown";
  searchTerm: string;
  filters: {
    onlyZetas?: boolean;
    onlyOmicrons?: boolean;
    category?: string;
  };
} => {
  const lowerQuery = query.toLowerCase();
  const filters: any = {};

  // Определяем тип запроса
  let type: "character" | "ability" | "team" | "gear" | "unknown" = "unknown";

  if (lowerQuery.includes("команда") || lowerQuery.includes("team")) {
    type = "team";
  } else if (
    lowerQuery.includes("способность") ||
    lowerQuery.includes("ability")
  ) {
    type = "ability";
  } else if (
    lowerQuery.includes("экипировка") ||
    lowerQuery.includes("gear")
  ) {
    type = "gear";
  } else {
    type = "character";
  }

  // Определяем фильтры
  if (lowerQuery.includes("дзета")) filters.onlyZetas = true;
  if (lowerQuery.includes("омикрон")) filters.onlyOmicrons = true;

  // Извлекаем поисковый термин
  const searchTerm = query
    .replace(/команда|team|способность|ability|экипировка|gear|дзета|омикрон/gi, "")
    .trim();

  return { type, searchTerm, filters };
};

/**
 * Транслирует английские термины в русские
 */
export const translateGameTerms = (text: string): string => {
  const translations: { [key: string]: string } = {
    "target lock": "захват цели",
    "ability block": "блок способностей",
    stun: "оглушение",
    offense: "атака",
    speed: "скорость",
    "turn meter": "шкала хода",
    protection: "защита",
    "max health": "максимум здоровья",
    tenacity: "стойкость",
    "defense penetration": "пробой защиты",
    taunt: "провокация",
    revive: "возрождение",
    dispel: "рассеивание",
    immunity: "иммунитет",
    burning: "сжигание",
    frostbite: "обморожение",
    expose: "уязвимость",
    daze: "ошеломление",
    detonator: "детонатор",
    healing: "исцеление",
    critical: "крит",
    potency: "эффективность",
    "turn order": "порядок ходов",
    cooldown: "перезарядка",
    dots: "дот",
    "damage over time": "урон со временем",
    leader: "лидер",
    unique: "уникальная",
    basic: "базовая",
    special: "спецспособность",
    zeta: "дзета",
    omega: "омега",
    omicron: "омикрон",
    ultimate: "ультимат",
  };

  let result = text;
  Object.entries(translations).forEach(([eng, rus]) => {
    const regex = new RegExp(`\\b${eng}\\b`, "gi");
    result = result.replace(regex, rus);
  });

  return result;
};

/**
 * Форматирует ответ для пользователя
 */
export const formatResponse = (content: string, confidence?: number): string => {
  let response = content;

  // Трансляция терминов
  response = translateGameTerms(response);

  // Добавление предупреждения о неуверенности, если необходимо
  if (confidence && confidence < 0.85) {
    response += "\n\n⚠️ Я не уверен в этом ответе на 100%, так как мои архивы Голонета всё ещё синхронизируются.";
  }

  return response;
};
