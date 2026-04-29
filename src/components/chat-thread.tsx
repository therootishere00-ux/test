"use client";

import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "loading" | "done" | "error";
  header?: string;
  subHeader?: string;
  hideActions?: boolean;
};

type ChatThreadProps = {
  messages: ChatMessage[];
  onRetry?: () => void;
};

function splitWords(content: string) {
  return content.split(/\s+/).filter(Boolean);
}

export function ChatThread({ messages, onRetry }: ChatThreadProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [revealedWords, setRevealedWords] = useState<Record<string, number>>({});
  const [ratings, setRatings] = useState<Record<string, "like" | "dislike" | null>>({});

  useEffect(() => {
    if (!viewportRef.current) return;
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [messages, revealedWords]);

  useEffect(() => {
    const pendingAssistant = [...messages]
      .reverse()
      .find((entry) => entry.role === "assistant" && entry.status !== "loading");

    if (!pendingAssistant) return;

    const words = splitWords(pendingAssistant.content);
    const revealedCount = revealedWords[pendingAssistant.id] ?? 0;

    if (revealedCount >= words.length) return;

    const timeoutId = window.setTimeout(() => {
      setRevealedWords((current) => ({
        ...current,
        [pendingAssistant.id]: Math.min((current[pendingAssistant.id] ?? 0) + 1, words.length)
      }));
    }, 12);

    return () => window.clearTimeout(timeoutId);
  }, [messages, revealedWords]);

  return (
    <div ref={viewportRef} className="visible-scrollbar flex-1 overflow-y-auto pr-1">
      <div className="space-y-8 pb-4 pt-2">
        {messages.map((entry) => {
          if (entry.role === "user") {
            return (
              <div key={entry.id} className="flex flex-col items-end gap-2 animate-message-in">
                <div className="max-w-[85%] rounded-[20px] bg-[#39704E]/10 px-4 py-3 text-[15px] leading-6 text-[#274333]">
                  {entry.content}
                </div>
              </div>
            );
          }

          const words = splitWords(entry.content);
          const visibleCount = revealedWords[entry.id] ?? 0;
          const isDone = words.length === 0 || visibleCount === words.length;
          const isLoading = entry.status === "loading";
          const isError = entry.status === "error";

          return (
            <div key={entry.id} className="flex flex-col gap-3 animate-message-in">
              <div className="flex gap-3 px-1">
                <div className="h-6 w-6 flex-shrink-0 pt-0.5">
                  <img src="/icons/applogo.PNG" alt="" className="h-5 w-5 object-contain" />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[16px] font-bold tracking-tight text-[#171717]">
                    {isLoading ? "Подумать Йоде нужно…" : (entry.header || "Yota 2.5")}
                  </span>
                  {isError && entry.subHeader && (
                    <span className="text-[13px] text-[#8C867D] leading-tight">
                      {entry.subHeader}
                    </span>
                  )}
                </div>
              </div>

              <div className={`w-full px-1 transition-opacity duration-300 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
                {entry.content && (
                  <div className="text-[15px] leading-7 text-[#2E2E2E]">
                    {words.slice(0, visibleCount).map((word, index) => (
                      <span key={`${entry.id}-${index}`} className="opacity-0 animate-message-in" style={{ animationFillMode: 'forwards' }}>
                        {index < visibleCount - 1 ? `${word}\u00A0` : word}
                      </span>
                    ))}
                  </div>
                )}

                {!entry.hideActions && isDone && (
                  <div className="mt-5 flex items-center gap-6 opacity-0 animate-message-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                    {isError ? (
                      <button 
                        onClick={() => onRetry?.()}
                        className="flex items-center gap-2 active:scale-95 transition-transform"
                      >
                        <img src="/icons/refresh.PNG" alt="" className="h-4 w-4 opacity-40" />
                        <span className="text-sm font-medium text-[#8C867D]">Попробовать снова</span>
                      </button>
                    ) : (
                      <>
                        <button className="active:scale-90 transition-transform">
                          <img src="/icons/refresh.PNG" alt="" className="h-4 w-4 opacity-35" />
                        </button>
                        <button className="active:scale-90 transition-transform">
                          <img src="/icons/like.PNG" alt="" className="h-4 w-4 opacity-35" />
                        </button>
                        <button className="active:scale-90 transition-transform">
                          <img src="/icons/dislike.PNG" alt="" className="h-4 w-4 opacity-35" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
