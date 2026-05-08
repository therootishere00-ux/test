import * as Comlink from "comlink";

let charactersDb: string = "";
let abilitiesDb: any[] = [];

const swgohEngine = {
  async initDatabase(charsText: string, abilitiesJson: any[]) {
    charactersDb = charsText;
    abilitiesDb = abilitiesJson;
  },

  async searchContext(query: string) {
    const q = query.toLowerCase();
    
    const charBlocks = charactersDb.split("---");
    const foundCharBlock = charBlocks.find(block => block.toLowerCase().includes(q));
    
    if (!foundCharBlock) return { charData: null, abilities: [] };

    const idMatch = foundCharBlock.match(/([A-Z0-9_]+)\s-\s/);
    const baseId = idMatch ? idMatch[1] : null;

    if (!baseId) return { charData: foundCharBlock, abilities: [] };

    const relatedAbilities = abilitiesDb.filter(a => a.character_base_id === baseId);

    return {
      charData: foundCharBlock,
      abilities: relatedAbilities
    };
  }
};

Comlink.expose(swgohEngine);
