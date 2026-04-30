"use client";

import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function splitWords(content: string) {
  return content.split(/\s+/).filter(Boolean);
}

export function ChatThread({ messages }: { messages: ChatMessage[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [revealedWords, setRevealedWords] = useState<Record<string, number>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, revealedWords]);

  useEffect(() => {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistant) return;

    const words = splitWords(lastAssistant.content);
    const count = revealedWords[lastAssistant.id] ?? 0;

    if (count < words.length) {
      const t = setTimeout(() => {
        setRevealedWords(prev => ({ ...prev, [lastAssistant.id]: count + 1 }));
      }, 30); // Скорость печати как в ChatGPT
      return () => clearTimeout(t);
    }
  }, [messages, revealedWords]);

  return (
    <div ref={scrollRef} className="visible-scrollbar h-full overflow-y-auto px-1 pt-4 pb-40">
      <div className="space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`${
              m.role === "user" 
                ? "chat-message-in max-w-[85%] rounded-[20px] bg-[#EDF5F0] px-4 py-2.5 text-[15px] text-[#274333]" 
                : "max-w-[90%] text-[15px] leading-relaxed text-[#2E2E2E]"
            }`}>
              {m.role === "user" ? m.content : (
                splitWords(m.content).slice(0, revealedWords[m.id] ?? 0).map((word, i) => (
                  <span key={i} className="chat-word">{word}&nbsp;</span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
