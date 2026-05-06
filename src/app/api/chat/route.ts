import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Проверяем оба возможных названия переменной
    const rawKey = process.env.GROQ_API || process.env.GROQ_API_KEY;

    if (!rawKey) {
      console.error("Критическая ошибка: Ключ API не найден в process.env");
      return NextResponse.json({ 
        error: "Ключ (GROQ_API или GROQ_API_KEY) не найден в настройках Vercel. Добавь его и сделай Redeploy." 
      }, { status: 500 });
    }

    // Очистка ключа от лишних символов
    const cleanKey = rawKey.replace(/['"]+/g, '').trim();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Ты — swgoh.ai. Отвечай кратко, как эксперт." },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ошибка Groq API:", data);
      return NextResponse.json({ 
        error: data.error?.message || `Ошибка API: ${response.status}` 
      }, { status: response.status });
    }

    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error: any) {
    console.error("Ошибка в route.ts:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
