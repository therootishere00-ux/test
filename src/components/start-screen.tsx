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
  const [prompts, setPrompts] = useState(() => pickPrompts(promptLibrary, 3));
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
      setPrompts(pickPrompts(promptLibrary, 3));
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
    }, 300);
  };

  const sendDisabled = message.trim().length < 2 || isEmojiOnly(message.trim());

  const renderComposer = () => (
    <div className="fixed bottom-[15px] left-0 right-0 z-20 px-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <form
          className="rounded-[18px] border border-[#E6E0D7] bg-[#FFFFFF] px-4 pb-3 pt-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage();
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={analysisEnabled ? "Что стоит анализировать.." : "Спросите Yota..."}
            rows={1}
            className="hide-scrollbar min-h-[24px] w-full resize-none bg-transparent py-1 text-[15px] leading-6 text-[#171717] outline-none placeholder:text-[#A09A90]"
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setAnalysisEnabled((value) => !value)}
              className={`inline-flex h-9 items-center gap-2 rounded-[12px] border px-3 transition-colors ${
                analysisEnabled
                  ? "border-[#CFE1D6] bg-[#EDF5F0] text-[#39704E]"
                  : "border-[#E3DED5] bg-[#F7F4EE] text-[#6F6A61]"
              }`}
            >
              <img
                src="/icons/firemode.PNG"
                alt=""
                className="h-4 w-4"
                style={analysisEnabled ? { filter: "invert(33%) sepia(21%) saturate(1005%) hue-rotate(94deg) brightness(96%) contrast(87%)" } : undefined}
              />
              <span className="text-sm font-medium">Анализ</span>
            </button>

            <button
              type="submit"
              disabled={sendDisabled}
              className={`grid h-9 w-9 place-items-center rounded-[12px] border transition-all duration-150 ${
                sendDisabled 
                  ? "bg-[#171717]/35 border-transparent opacity-55" 
                  : "bg-[#171717] border-[#171717] opacity-100 active:scale-95"
              }`}
            >
              <img src="/icons/send.PNG" alt="" className="h-[16px] w-[16px] brightness-0 invert" />
            </button>
          </div>
        </form>
        {!chatStarted && (
          <p className="text-center text-xs text-[#9A948A]">Это ИИ, он может допускать ошибки</p>
        )}
      </div>
    </div>
  );

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#F5F3EE] text-[#171717] select-none">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col px-4 pt-6">
        {/* Header (Original Icons) */}
        <div className="z-10 flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="grid h-9 w-9 place-items-center">
            <img src="/icons/menu.PNG" alt="" className="h-[20px] w-[20px]" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-[18px] font-black tracking-tight">
              swgoh<span className="opacity-65">.ai</span>
            </h1>
          </div>
          <button className="grid h-9 w-9 place-items-center">
            <img src="/icons/profile.PNG" alt="" className="h-[20px] w-[20px]" />
          </button>
        </div>

        <section className="relative flex-1 flex flex-col">
          {/* Центрированный контент */}
          {!chatStarted && (
            <div className="flex flex-1 flex-col items-center justify-center pb-32">
              <div className="space-y-2 text-center mb-10">
                <h2 className="text-[36px] font-semibold leading-[1.1] tracking-[-0.04em]">
                  Ну привет, {name}.
                </h2>
                <p className="text-[36px] font-semibold leading-[1.1] tracking-[-0.04em] opacity-40">
                  С чем тебе помочь?
                </p>
              </div>

              <div className="w-full space-y-2.5 px-2">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessage(prompt)}
                    className="flex w-full items-center justify-between rounded-[16px] border border-[#E6E0D7] bg-[#FBFAF7] px-4 py-3.5 text-left text-[14px] leading-snug text-[#2A2A2A] transition-all active:scale-[0.98] active:bg-[#F3EFE8]"
                  >
                    <span>{prompt}</span>
                    <img src="/icons/right.PNG" alt="" className="h-[12px] w-[12px] opacity-40" />
                  </button>
                ))}
                
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C867D] uppercase tracking-wider opacity-80 active:opacity-100"
                  >
                    <img src="/icons/refresh.PNG" alt="" className="h-[14px] w-[14px]" />
                    Перемешать
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat View */}
          <div className={`flex-1 overflow-hidden transition-opacity duration-200 ${chatStarted ? 'opacity-100 mt-4' : 'pointer-events-none opacity-0'}`}>
            {chatStarted && <ChatThread messages={messages} />}
          </div>
        </section>

        {renderComposer()}
      </div>
    </main>
  );
}
