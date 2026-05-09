import { NextResponse } from "next/server";
import { 
  findCharacterByName, 
  getCharacterAbilities,
  searchCharacters 
} from "@/lib/dataLoader";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "search"; // search, exact

    if (!query) {
      return NextResponse.json({ 
        error: "Query parameter required" 
      }, { status: 400 });
    }

    let results;

    if (type === "exact") {
      const character = findCharacterByName(query);
      if (!character) {
        return NextResponse.json({ 
          error: "Character not found" 
        }, { status: 404 });
      }
      
      const abilities = getCharacterAbilities(character.base_id);
      results = { character, abilities };
    } else {
      const characters = searchCharacters(query);
      results = {
        total: characters.length,
        characters: characters.slice(0, 10).map(char => ({
          name: char.name,
          base_id: char.base_id,
          power: char.power,
          description: char.description
        }))
      };
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
