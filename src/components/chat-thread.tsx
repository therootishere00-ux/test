"use client";

import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatThreadProps = {
  messages: ChatMessage[];
};

function splitWords(content: string) {
  return content.split(/\s+/).filter(Boolean);
}

export function ChatThread({ messages }: ChatThreadProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [revealedWords, setRevealedWords] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [messages, revealedWords]);

  useEffect(() => {
    const pendingAssistant = [...messages]
      .reverse()
      .find((entry) => entry.role === "assistant");

    if (!pendingAssistant) {
      return;
    }

    const words = splitWords(pendingAssistant.content);
    const revealedCount = revealedWords[pendingAssistant.id] ?? 0;

    if (revealedCount >= words.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRevealedWords((current) => ({
        ...current,
        [pendingAssistant.id]: Math.min((current[pendingAssistant.id] ?? 0) + 1, words.length)
      }));
    }, 28);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [messages, revealedWords]);

  return (
    <div ref={viewportRef} className="visible-scrollbar flex-1 overflow-y-auto pr-1">
      <div className="space-y-5 pb-6 pt-2">
        {messages.map((entry) => {
          if (entry.role === "user") {
            return (
              <div key={entry.id} className="flex justify-end">
                {/* Обновленный стиль: полупрозрачный акцентный цвет */}
                <div className="chat-message-in max-w-[84%] rounded-[18px] bg-[#39704E]/15 border border-[#39704E]/10 px-4 py-3 text-[15px] leading-6 text-[#274333]">
                  {entry.content}
                </div>
              </div>
            );
          }

          const words = splitWords(entry.content);
          const visibleCount = revealedWords[entry.id] ?? 0;

          return (
            <div key={entry.id} className="flex justify-start">
              <div className="max-w-[88%] px-1 text-[15px] leading-7 text-[#2E2E2E]">
                {words.slice(0, visibleCount).map((word, index) => (
                  <span key={`${entry.id}-${index}-${word}`} className="chat-word">
                    {index < visibleCount - 1 ? `${word}\u00A0` : word}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
