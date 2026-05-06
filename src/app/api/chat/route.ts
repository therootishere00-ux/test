export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    const apiKey = process.env.GROQ_API;

    // Ошибка 1: Нет ключа
    if (!apiKey) {
      console.error("CRITICAL ERROR: GROQ_API is EMPTY");
      return NextResponse.json({ 
        error: "Прости, но сервер загружен. Приходи позже!" 
      }, { status: 500 });
    }

    const cleanKey = apiKey.replace(/['"]+/g, '').trim();

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
        temperature: 0.7
      })
    });

    const data = await response.json();

    // Ошибка 2: Groq вернул ошибку (лимиты, перегрузка)
    if (!response.ok) {
      console.error("GROQ API ERROR:", response.status, data);
      return NextResponse.json({ 
        error: "Прости, но сервер загружен. Приходи позже!" 
      }, { status: response.status });
    }

    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error: any) {
    // Ошибка 3: Упал наш сервер
    console.error("SERVER CATCH BLOCK ERROR:", error.message);
    return NextResponse.json({ 
      error: "Прости, но сервер загружен. Приходи позже!" 
    }, { status: 500 });
  }
}
