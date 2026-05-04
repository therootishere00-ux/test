import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile", // Быстрая и с огромным окном
        messages: [
          { role: "system", content: "Ты — полезный AI-ассистент swgoh.ai." },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Groq error" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
