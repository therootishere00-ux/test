import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: "API Key не найден. Проверь настройки Vercel и сделай Redeploy." 
      }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Ты — swgoh.ai. Отвечай кратко, как эксперт." },
          ...messages
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Ошибка API" }, { status: response.status });
    }

    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
