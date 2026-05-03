import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // или mixtral-8x7b-32768
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Прости, но сейчас сервера загружены (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ text: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json(
      { error: 'Прости, но сейчас сервера загружены (500)' },
      { status: 500 }
    );
  }
}
