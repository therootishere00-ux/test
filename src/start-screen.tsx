"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { MenuDrawer } from "@/components/menu-drawer";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const promptLibrary = [
  "Собери план прокачки аккаунта на 30 дней",
  "Подбери контр-пики под текущий GAC",
  "С чего начать путь к Galactic Legend",
  "Разбери мои слабые места по модам",
  "Кого качать следующим из текущего ростера",
  "Собери эффективный флот для ранней игры",
  "Какие омеги и зеты важнее всего сейчас",
  "Как ускорить фарм ключевых команд",
  "Какие герои сильнее для Conquest",
  "Как выжать максимум из текущего инвентаря",
  "Проведи аудит ресурсов и узких мест",
  "Подбери составы под Territory War"
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

  if (!normalized) {
    return false;
  }

  const withoutEmoji = normalized
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu, "")
    .replace(/\s/gu, "");

  return withoutEmoji.length === 0;
}

export function StartScreen() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
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

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";

    const nextHeight = Math.min(textarea.scrollHeight, 120);

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 120 ? "auto" : "hidden";
  }, [message]);

  useEffect(() => {
    if (!chatScrollRef.current) {
      return;
    }

    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages]);

  const handleShuffle = () => {
    startTransition(() => {
      setPrompts(pickPrompts(promptLibrary, 5));
    });
  };

  const sendDisabled = message.trim().length < 2 || isEmojiOnly(message.trim());

  const analysisIconStyle = analysisEnabled
    ? {
        filter:
          "brightness(0) saturate(100%) invert(39%) sepia(18%) saturate(892%) hue-rotate(94deg) brightness(94%) contrast(88%)"
      }
    : undefined;

  const submitMessage = () => {
    const normalized = message.trim();

    if (normalized.length < 2 || isEmojiOnly(normalized)) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: normalized
    };

    setChatStarted(true);
    setMessages((current) => [...current, userMessage]);
    setMessage("");

    window.setTimeout(() => {
      setMessages((current) => {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: demoReply
        };

        return [...current, assistantMessage];
      });
    }, 260);
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#F5F3EE] text-[#171717] select-none">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-6">
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Меню"
            onClick={() => setMenuOpen(true)}
            className="grid h-9 w-9 place-items-center text-[#171717]"
          >
            <img src="/icons/menu.PNG" alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
          </button>
        </div>

        <section className="relative flex flex-1 flex-col">
          <div
            className={`transition-all duration-300 ${
              chatStarted
                ? "pointer-events-none max-h-0 -translate-y-3 overflow-hidden opacity-0"
                : "max-h-[520px] translate-y-0 opacity-100"
            }`}
          >
            <div className="space-y-6 pt-8">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-3">
                  <img
                    src="/icons/applogo.PNG"
                    alt=""
                    aria-hidden="true"
                    className="h-9 w-9 rounded-[10px] object-cover"
                  />
                  <h1 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171717]">
                    Ну привет, {name}
                  </h1>
                </div>
                <p className="text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171717]">
                  С чем тебе помочь?
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#8C867D]">Начать можно так</p>

                <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1 pr-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setMessage(prompt)}
                      className="shrink-0 rounded-[14px] border border-[#E6E0D7] bg-[#FBFAF7] px-4 py-3 text-left text-sm leading-snug text-[#2A2A2A]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleShuffle}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#8C867D]"
                >
                  <img
                    src="/icons/refresh.PNG"
                    alt=""
                    aria-hidden="true"
                    className="h-[15px] w-[15px]"
                  />
                  Перемешать
                </button>
              </div>
            </div>
          </div>

          <div
            ref={chatScrollRef}
            className={`hide-scrollbar flex-1 overflow-y-auto transition-all duration-300 ${
              chatStarted ? "mt-6 opacity-100" : "pointer-events-none mt-0 opacity-0"
            }`}
          >
            <div className="space-y-5 pb-6 pt-2">
              {messages.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {entry.role === "user" ? (
                    <div className="max-w-[84%] rounded-[18px] border border-[#E2DCCE] bg-[#FFFFFF] px-4 py-3 text-[15px] leading-6 text-[#171717]">
                      {entry.content}
                    </div>
                  ) : (
                    <div className="max-w-[88%] px-1 text-[15px] leading-7 text-[#2E2E2E]">
                      {entry.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`transition-all duration-300 ${
              chatStarted ? "mt-auto translate-y-0" : "my-auto translate-y-0"
            }`}
          >
            <div className="space-y-3">
              <form
                className="rounded-[18px] border border-[#E6E0D7] bg-[#FFFFFF] px-4 pb-3 pt-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitMessage();
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Спроси про состав, моды или план развития..."
                  aria-label="Ввести сообщение"
                  rows={1}
                  className="hide-scrollbar min-h-[24px] w-full resize-none bg-transparent py-1 text-[15px] leading-6 text-[#171717] outline-none placeholder:text-[#A09A90]"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setAnalysisEnabled((value) => !value)}
                    className={`inline-flex h-9 items-center gap-2 rounded-[12px] border px-3 ${
                      analysisEnabled
                        ? "border-[#CFE1D6] bg-[#EDF5F0] text-[#39704E]"
                        : "border-[#E3DED5] bg-[#F7F4EE] text-[#6F6A61]"
                    }`}
                  >
                    <img
                      src="/icons/firemode.PNG"
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4"
                      style={analysisIconStyle}
                    />
                    <span className="text-sm font-medium">Анализ</span>
                  </button>

                  <div className="pl-3">
                    <button
                      type="submit"
                      aria-label="Отправить сообщение"
                      disabled={sendDisabled}
                      className={`grid h-9 w-9 place-items-center rounded-[12px] border border-[#171717] transition-all duration-150 ${
                        sendDisabled ? "bg-[#171717]/35 opacity-55" : "bg-[#171717] opacity-100"
                      }`}
                    >
                      <img
                        src="/icons/send.PNG"
                        alt=""
                        aria-hidden="true"
                        className="h-[16px] w-[16px] brightness-0 invert"
                      />
                    </button>
                  </div>
                </div>
              </form>

              <p className="text-center text-xs text-[#9A948A]">Это ИИ, он может допускать ошибки</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
