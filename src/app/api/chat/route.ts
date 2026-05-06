export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Проверяем, видит ли сервер переменную после билда
    const rawKey = process.env.GROQ_API;

    if (!rawKey) {
      console.error("❌ СЕРВЕР: GROQ_API всё еще undefined. Требуется Redeploy!");
      return NextResponse.json({ 
        error: "Ключ GROQ_API не найден. Убедись, что сделал Redeploy после добавления переменной." 
      }, { status: 500 });
    }

    const cleanKey = rawKey.replace(/['"]+/g, '').trim();
    console.log("✅ СЕРВЕР: Ключ найден, отправляем запрос в Groq");

    const response = await fetch("https://api.api.groq.com/openai/v1/chat/completions", {
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
      console.error("❌ GROQ API Error:", data);
      return NextResponse.json({ 
        error: data.error?.message || `Groq Error: ${response.status}` 
      }, { status: response.status });
    }

    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error: any) {
    console.error("❌ CRITICAL ERROR:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера." }, { status: 500 });
  }
}
