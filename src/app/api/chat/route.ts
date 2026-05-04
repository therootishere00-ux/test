import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Берем ключ из новой переменной GROQ_API
    const rawKey = process.env.GROQ_API;

    if (!rawKey) {
      console.error("Environment variable GROQ_API is missing");
      return NextResponse.json({ 
        error: "Ключ GROQ_API не найден в настройках Vercel. Проверь раздел Environment Variables." 
      }, { status: 500 });
    }

    // Очищаем ключ от пробелов, кавычек и возможных невидимых символов
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
      console.error("Groq API Error Response:", data);
      // Пробрасываем конкретную ошибку от Groq, чтобы понимать причину
      return NextResponse.json({ 
        error: data.error?.message || `Groq Error: ${response.status}` 
      }, { status: response.status });
    }

    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error: any) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: "Ошибка на стороне сервера. Попробуй позже." }, { status: 500 });
  }
}
