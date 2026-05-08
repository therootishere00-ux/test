import * as Comlink from "comlink";

// Типы для наших данных
let database: {
  units: any[];
  abilities: any[];
  characters: any[];
} = { units: [], abilities: [], characters: [] };

const swgohEngine = {
  async initDatabase(units: any, abilities: any, characters: any) {
    database.units = units;
    database.abilities = abilities;
    database.characters = characters;
    console.log("SWGOH Engine: Database indexed");
  },

  async findUnitData(query: string) {
    const q = query.toLowerCase();
    // Ищем персонажа по имени или ID
    const unit = database.units.find(u => 
      u.name.toLowerCase().includes(q) || u.base_id.toLowerCase() === q
    );

    if (!unit) return null;

    // Собираем все его способности из abilities.json
    const unitAbilities = database.abilities.filter(a => a.character_base_id === unit.base_id);

    return {
      ...unit,
      fullAbilities: unitAbilities
    };
  }
};

Comlink.expose(swgohEngine);
