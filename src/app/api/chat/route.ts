// Заставляем Vercel ВСЕГДА проверять переменные при каждом запросе
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Явно указываем стандартную среду выполнения

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("--- NEW REQUEST ---");
  
  try {
    const body = await req.json();
    const messages = body.messages || [];

    // Попытка достать ключ
    const apiKey = process.env.GROQ_API;

    // ЛОГ ДЛЯ ТВОЕЙ КОНСОЛИ (мы увидим это в AdminConsole)
    if (!apiKey) {
      console.error("DEBUG: process.env.GROQ_API is EMPTY");
      return NextResponse.json({ 
        error: `Ключ не найден. Текущие ключи: ${Object.keys(process.env).filter(k => k.includes('API')).join(', ')}` 
      }, { status: 500 });
    }

    const cleanKey = apiKey.replace(/['"]+/g, '').trim();
    
    console.log("DEBUG: Sending to Groq...");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Ты — swgoh.ai. Отвечай кратко." },
          ...messages
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("DEBUG: Groq Error Status:", response.status);
      return NextResponse.json({ error: data.error?.message || "Groq API Error" }, { status: response.status });
    }

    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error: any) {
    console.error("DEBUG: Catch Block:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
