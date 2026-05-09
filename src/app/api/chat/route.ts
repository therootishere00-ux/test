export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { buildContextForQuery, buildAnalyticsContext } from "@/lib/contextBuilder";
import { analyzeQuery } from "@/lib/swgohService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    const apiKey = process.env.GROQ_API;

    if (!apiKey) {
      console.error("CRITICAL ERROR: GROQ_API is EMPTY");
      return NextResponse.json({ 
        error: "Прости, но сервер загружен. Приходи позже!" 
      }, { status: 500 });
    }

    // Читаем системную инструкцию из файла
    let systemContent = "Ты — swgoh.ai. Отвечай кратко, как эксперт.";
    try {
      const promptPath = path.join(process.cwd(), "system-prompt.txt");
      systemContent = fs.readFileSync(promptPath, "utf-8");
    } catch (err) {
      console.error("System prompt file not found, using default");
    }

    // Получаем последнее сообщение пользователя для анализа контекста
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg: any) => msg.role === "user");

    let contextData = "";

    if (lastUserMessage) {
      const query = lastUserMessage.content;
      
      try {
        // Анализируем запрос и определяем нужный контекст
        const queryAnalysis = analyzeQuery(query);
        
        // В зависимости от типа запроса, собираем разный контекст
        if (queryAnalysis.type === "character" || queryAnalysis.type === "ability") {
          contextData = buildContextForQuery(query);
        } else if (queryAnalysis.type === "team") {
          contextData = buildContextForQuery(query);
        } else {
          contextData = buildAnalyticsContext(query);
        }

        console.log("Context Data Generated:", contextData.substring(0, 100) + "...");
      } catch (contextError) {
        console.warn("Error building context:", contextError);
        // Продолжаем без контекста, если произойдёт ошибка
      }
    }

    // Подготавливаем сообщения с контекстом
    const messagesWithContext = messages.map((msg: any) => {
      if (msg.role === "user" && contextData) {
        return {
          ...msg,
          content: `${contextData}\n\n=== ВОПРОС ПОЛЬЗОВАТЕЛЯ ===\n${msg.content}`,
        };
      }
      return msg;
    });

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
          { role: "system", content: systemContent },
          ...messagesWithContext
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("GROQ API ERROR:", response.status, data);
      return NextResponse.json({ 
        error: "Прости, но сервер загружен. Приходи позже!" 
      }, { status: response.status });
    }

    return NextResponse.json({ 
      content: data.choices[0].message.content,
      usage: data.usage 
    });

  } catch (error: any) {
    console.error("SERVER CATCH BLOCK ERROR:", error.message);
    return NextResponse.json({ 
      error: "Прости, но сервер загружен. Приходи позже!" 
    }, { status: 500 });
  }
}
