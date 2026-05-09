import {
  loadCharacters,
  loadAbilities,
  findCharacterByName,
  findCharacterById,
  getCharacterAbilities,
  getCharacterZetas,
  getCharacterOmicrons,
  searchCharacters,
  Character,
  Ability,
} from "./dataLoader";
import { formatCharacterDescription, formatAbilityInfo } from "./swgohService";

/**
 * Создаёт контекст с информацией о персонаже для передачи в LLM
 */
export const createCharacterContext = (
  characterId: string
): { character: Character; abilities: Ability[] } | null => {
  const character = findCharacterById(characterId);
  if (!character) return null;

  const abilities = getCharacterAbilities(characterId);
  return { character, abilities };
};

/**
 * Создаёт расширенный контекст для ответа на вопрос
 */
export const buildContextForQuery = (query: string): string => {
  let context = "=== КОНТЕКСТ ИГРЫ SWGOH ===\n\n";

  // Поиск упомянутых персонажей
  const characters = searchCharacters(query);

  if (characters.length > 0) {
    context += "=== НАЙДЕННЫЕ ПЕРСОНАЖИ ===\n\n";

    characters.slice(0, 3).forEach((character) => {
      const abilities = getCharacterAbilities(character.base_id);
      context += formatCharacterDescription(character, abilities);
      context += "\n---\n\n";
    });
  }

  // Добавляем информацию о способностях
  const abilities = loadAbilities();
  const mentionedAbilities = abilities.filter((ability) =>
    query.toLowerCase().includes(ability.name.toLowerCase())
  );

  if (mentionedAbilities.length > 0) {
    context += "=== УПОМЯНУТЫЕ СПОСОБНОСТИ ===\n\n";
    mentionedAbilities.slice(0, 5).forEach((ability) => {
      context += formatAbilityInfo(ability);
      context += "\n---\n\n";
    });
  }

  return context;
};

/**
 * Создаёт сокращённый контекст для быстрого ответа
 */
export const buildQuickContext = (
  characterName: string
): { character: Character; zetas: Ability[]; omicrons: Ability[] } | null => {
  const character = findCharacterByName(characterName);
  if (!character) return null;

  const zetas = getCharacterZetas(character.base_id);
  const omicrons = getCharacterOmicrons(character.base_id);

  return { character, zetas, omicrons };
};

/**
 * Форматирует список персонажей для контекста
 */
export const formatCharactersList = (characters: Character[]): string => {
  if (characters.length === 0) return "Персонажи не найдены.";

  return characters
    .slice(0, 10)
    .map(
      (char) =>
        `- ${char.name} (\`${char.base_id}\`) - Мощь: ${char.power}`
    )
    .join("\n");
};

/**
 * Получает все дзеты в игре
 */
export const getAllZetas = (): Ability[] => {
  const abilities = loadAbilities();
  return abilities.filter((ability) => ability.is_zeta);
};

/**
 * Получает все омикроны в игре
 */
export const getAllOmicrons = (): Ability[] => {
  const abilities = loadAbilities();
  return abilities.filter((ability) => ability.is_omicron);
};

/**
 * Получает все ультиматы в игре
 */
export const getAllUltimates = (): Ability[] => {
  const abilities = loadAbilities();
  return abilities.filter((ability) => ability.is_ultimate);
};

/**
 * Создаёт полный контекст для аналитических вопросов
 */
export const buildAnalyticsContext = (query: string): string => {
  const characters = loadCharacters();
  const abilities = loadAbilities();

  let context = "=== ОБЩАЯ ИНФОРМАЦИЯ ИГРЫ ===\n\n";

  context += `Всего персонажей: ${characters.length}\n`;
  context += `Всего способностей: ${abilities.length}\n`;
  context += `Дзет в игре: ${getAllZetas().length}\n`;
  context += `Омикронов в игре: ${getAllOmicrons().length}\n`;
  context += `Ультиматов в игре: ${getAllUltimates().length}\n\n`;

  // Добавляем специфичный контекст на основе запроса
  if (query.toLowerCase().includes("дзета")) {
    context += "=== ДЗЕТЫ ===\n";
    getAllZetas()
      .slice(0, 5)
      .forEach((zeta) => {
        context += `- ${zeta.name} (${zeta.character_base_id}): ${zeta.description.substring(0, 80)}...\n`;
      });
  }

  if (query.toLowerCase().includes("омикрон")) {
    context += "\n=== ОМИКРОНЫ ===\n";
    getAllOmicrons()
      .slice(0, 5)
      .forEach((omicron) => {
        context += `- ${omicron.name} (${omicron.character_base_id})\n`;
      });
  }

  return context;
};
