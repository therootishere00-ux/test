import * as Comlink from "comlink";

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
  },

  async findUnitData(query: string) {
    const q = query.toLowerCase();
    const unit = database.units.find(u => 
      u.name.toLowerCase().includes(q) || u.base_id.toLowerCase() === q
    );

    if (!unit) return null;

    const unitAbilities = database.abilities.filter(a => a.character_base_id === unit.base_id);

    return {
      ...unit,
      fullAbilities: unitAbilities
    };
  }
};

Comlink.expose(swgohEngine);
