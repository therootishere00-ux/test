"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

const promptLibrary = [
  "Собери план прокачки с нуля",
  "Кого выбрать первой легендой?",
  "Как улучшить мой GAC рейтинг",
  "В чём я явно отстаю от других",
  "Какие герои дадут мне больше всего",
  "Как правильно расходовать ресурсы",
  "Что качать в первую очередь",
  "Подскажи по моему текущему составу",
  "Как подготовиться к войне за территорию",
  "Что мне не хватает для флота",
  "Расскажи про мои узкие места",
  "Как получить первую легенду быстрее"
];

const demoReply =
  "Понял. В демо-режиме я пока не анализирую данные SWGOH, но структура чата уже готова: здесь будут ответы ассистента, рекомендации и разбор состава.";

function getTelegramName() {
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const firstName = webApp?.initDataUnsafe?.user?.first_name?.trim();
  return firstName || "Артем";
}

function pickPrompts(source: string[], amount: number) {
  const items = [...source];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
  }
  return items.slice(0, amount);
}

function isEmojiOnly(value: string) {
  const normalized = value.trim();
  if (!normalized) return false;
  const withoutEmoji = normalized
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu, "")
    .replace(/\s/gu, "");
  return withoutEmoji.length === 0;
}

export function StartScreen() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [name, setName] = useState("Артем");
  const [message, setMessage] = useState("");
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prompts, setPrompts] = useState(() => pickPrompts(promptLibrary, 5));
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setName(getTelegramName());
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 120 ? "auto" : "hidden";
  }, [message]);

  const handleShuffle = () => {
    startTransition(() => {
      setPrompts(pickPrompts(promptLibrary, 5));
    });
  };

  const submitMessage = () => {
    const normalized = message.trim();
    if (normalized.length < 2 || isEmojiOnly(normalized)) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: normalized
    };

    setChatStarted(true);
    setMessages((current) => [...current, userMessage]);
    setMessage("");

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", content: demoReply }
      ]);
    }, 400);
  };

  const renderComposer = () => (
    <div className="fixed bottom-[15px] left-0 right-0 z-20 px-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <form
          className="rounded-[22px] border border-[#E6E0D7] bg-[#FFFFFF] px-4 pb-3 pt-3 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage();
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={analysisEnabled ? "Что анализируем?" : "Спросите Yota..."}
            rows={1}
            className="hide-scrollbar min-h-[24px] w-full resize-none bg-transparent py-1 text-[15px] leading-6 text-[#171717] outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAnalysisEnabled(!analysisEnabled)}
              className={`flex h-8 items-center gap-2 rounded-full px-3 transition-colors ${
                analysisEnabled ? "bg-[#EDF5F0] text-[#39704E]" : "bg-[#F7F4EE] text-[#6F6A61]"
              }`}
            >
              <img src="/icons/firemode.PNG" className="h-3.5 w-3.5" alt="" />
              <span className="text-xs font-semibold">Анализ</span>
            </button>
            <button
              type="submit"
              disabled={message.trim().length < 2}
              className={`grid h-8 w-8 place-items-center rounded-full transition-all ${
                message.trim().length < 2 ? "bg-[#171717]/20" : "bg-[#171717]"
              }`}
            >
              <img src="/icons/send.PNG" className="h-3.5 w-3.5 brightness-0 invert" alt="" />
            </button>
          </div>
        </form>
        {!chatStarted && (
          <p className="text-center text-[10px] text-[#9A948A]">Это ИИ, он может ошибаться</p>
        )}
      </div>
    </div>
  );

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#F5F3EE] text-[#171717]">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col px-4 pt-6">
        {/* Header */}
        <div className="z-10 flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="p-2">
            <img src="/icons/menu.PNG" className="h-5 w-5" alt="" />
          </button>
          <h1 className="text-lg font-black italic tracking-tighter">swgoh.ai</h1>
          <button className="p-2">
            <img src="/icons/profile.PNG" className="h-5 w-5" alt="" />
          </button>
        </div>

        {/* Content Area */}
        <section className="relative flex-1 flex flex-col">
          {/* Start View - Centered */}
          {!chatStarted && (
            <div className="flex flex-1 flex-col items-center justify-center pb-32 text-center">
              <h2 className="text-[32px] font-bold leading-tight tracking-tight mb-8">
                Ну привет, {name}.<br />
                С чем тебе помочь?
              </h2>
              
              <div className="w-full space-y-2">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setMessage(prompt)}
                    className="w-full rounded-xl border border-[#E6E0D7] bg-white/50 px-4 py-3 text-left text-sm transition-active active:scale-[0.98]"
                  >
                    {prompt}
                  </button>
                ))}
                <button onClick={handleShuffle} className="text-xs font-medium text-[#8C867D] pt-2">
                  ↻ Перемешать подсказки
                </button>
              </div>
            </div>
          )}

          {/* Chat View */}
          <div className={`flex-1 overflow-hidden transition-opacity duration-200 ${chatStarted ? 'opacity-100' : 'opacity-0'}`}>
            {chatStarted && <ChatThread messages={messages} />}
          </div>
        </section>

        {renderComposer()}
      </div>
    </main>
  );
}
