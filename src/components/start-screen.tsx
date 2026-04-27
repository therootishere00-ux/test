"use client";

import { startTransition, useEffect, useRef, useState } from "react";

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

function getTelegramName() {
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const firstName = webApp?.initDataUnsafe?.user?.first_name?.trim();
  return firstName || "Артем";
}

function pickFivePrompts(source: string[]) {
  const items = [...source];

  for (let index = items.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
  }

  return items.slice(0, 5);
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
  const infoRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("Артем");
  const [message, setMessage] = useState("");
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [prompts, setPrompts] = useState(() => promptLibrary.slice(0, 5));
  const [infoOpen, setInfoOpen] = useState(false);

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
    if (!infoOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setInfoOpen(false);
    }, 3000);

    const handlePointerDown = (event: PointerEvent) => {
      if (!infoRef.current?.contains(event.target as Node)) {
        setInfoOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [infoOpen]);
