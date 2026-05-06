export const dynamic = 'force-dynamic'; // Отключаем кэширование, заставляем Vercel обрабатывать каждый запрос

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🚀 [POST /api/chat] Входящий запрос получен"); // Теперь это появится в логах Vercel

  try {
    const body = await req.json();
    console.log(`📦 Тело запроса обработано. Сообщений: ${body.messages?.length || 0}`);

    const rawKey = process.env.GROQ_API;

    if (!rawKey) {
      console.error("❌ ВНИМАНИЕ: Переменная GROQ_API отсутствует в Vercel!");
      return NextResponse.json({ 
        error: "Ключ GROQ_API не найден в настройках Vercel. Проверь раздел Environment Variables." 
      }, { status: 500 });
    }

    const cleanKey = rawKey.replace(/['"]+/g, '').trim();

    console.log("🌐 Отправка запроса к серверам Groq...");
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
          ...body.messages
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Ошибка от API Groq:", data);
      return NextResponse.json({ 
        error: data.error?.message || `Groq Error: ${response.status}` 
      }, { status: response.status });
    }

    console.log("✅ Успешный ответ от Groq сгенерирован");
    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error: any) {
    console.error("❌ Внутренняя ошибка сервера:", error);
    return NextResponse.json({ error: "Ошибка на стороне сервера. Попробуй позже." }, { status: 500 });
  }
}
