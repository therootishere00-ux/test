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
  const modelRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("Артем");
  const [message, setMessage] = useState("");
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prompts, setPrompts] = useState(() => pickPrompts(promptLibrary, 5));
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [modelName, setModelName] = useState("Yota 3.5");

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
    if (!modelOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!modelRef.current?.contains(event.target as Node)) {
        setModelOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [modelOpen]);

  const handleShuffle = () => {
    startTransition(() => {
      setPrompts(pickPrompts(promptLibrary, 5));
    });
  };

  const sendDisabled = message.trim().length < 2 || isEmojiOnly(message.trim());
  const inputPlaceholder = analysisEnabled
    ? "Что стоит анализировать.."
    : "Спросите Yota...";

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

  const renderComposer = () => (
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
          placeholder={inputPlaceholder}
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
      </form>

      <p className="text-center text-xs text-[#9A948A]">Это ИИ, он может допускать ошибки</p>
    </div>
  );

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#F5F3EE] text-[#171717] select-none">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-6">
        {/* Хедер с логотипом и иконками */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            aria-label="Меню"
            onClick={() => setMenuOpen(true)}
            className="grid h-9 w-9 place-items-center text-[#171717]"
          >
            <img src="/icons/menu.PNG" alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
          </button>

          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-[18px] font-black tracking-tight">
              swgoh<span className="opacity-65">.ai</span>
            </h1>
          </div>

          <button
            type="button"
            aria-label="Профиль"
            className="grid h-9 w-9 place-items-center text-[#171717]"
          >
            <img src="/icons/profile.PNG" alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
          </button>
        </div>

        <section className="relative flex flex-1 flex-col">
          <div
            className={`flex flex-1 flex-col justify-center transition-all duration-300 ${
              chatStarted
                ? "pointer-events-none max-h-0 -translate-y-3 overflow-hidden opacity-0"
                : "max-h-[640px] translate-y-0 opacity-100"
            }`}
          >
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <h1 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171717]">
                  Ну привет, {name}
                </h1>
                <p className="text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171717]">
                  С чем тебе помочь?
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#8C867D]">Начать можно так</p>

                <div className="hide-scrollbar flex flex-col gap-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setMessage(prompt)}
                      className="flex items-center justify-between rounded-[14px] border border-[#E6E0D7] bg-[#FBFAF7] px-4 py-3 text-left text-sm leading-snug text-[#2A2A2A]"
                    >
                      <span>{prompt}</span>
                      <img
                        src="/icons/right.PNG"
                        alt=""
                        aria-hidden="true"
                        className="h-[12px] w-[12px] opacity-65 flex-shrink-0 ml-2"
                      />
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

              {renderComposer()}
            </div>
          </div>

          <div
            className={`hide-scrollbar flex-1 overflow-y-auto transition-all duration-300 ${
              chatStarted ? "mt-6 opacity-100" : "pointer-events-none mt-0 opacity-0"
            }`}
          >
            {chatStarted ? <ChatThread messages={messages} /> : null}
          </div>

          <div
            className={`transition-all duration-300 ${
              chatStarted ? "mt-auto translate-y-0 opacity-100" : "pointer-events-none max-h-0 translate-y-3 overflow-hidden opacity-0"
            }`}
          >
            {renderComposer()}
          </div>
        </section>
      </div>
    </main>
  );
}
