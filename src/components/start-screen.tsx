"use client";

import { useEffect, useMemo, useState } from "react";

const greetings = [
  "Да прибудет сила",
  "Что на душе?",
  "Сап, {name}",
  "Привет, {name}"
];

const suggestions = [
  "Кого качать первым?",
  "Что собрать для рейда?",
  "Какие моды поставить?"
];

function getTelegramName() {
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const firstName = webApp?.initDataUnsafe?.user?.first_name?.trim();
  return firstName || "друг";
}

function pickGreeting(name: string) {
  const index =
    [...name].reduce((sum, char) => sum + char.codePointAt(0)!, 0) % greetings.length;
  return greetings[index].replace("{name}", name);
}

export function StartScreen() {
  const [name, setName] = useState("друг");
  const [message, setMessage] = useState("");
  const greeting = useMemo(() => pickGreeting(name), [name]);

  useEffect(() => {
    setName(getTelegramName());
  }, []);

  return (
    <main className="screen min-h-dvh w-full">
      <button className="menu-button" type="button" aria-label="Открыть меню">
        <img src="/icons/menu.PNG" alt="" aria-hidden="true" className="menu-icon" />
      </button>

      <div className="app grid">
        <section className="center w-full" aria-label="Стартовый экран">
          <div className="hero">
            <img src="/icons/applogo.PNG" alt="" className="logo" />
            <p className="eyebrow">Чат для SWGOH</p>
            <h1>{greeting}</h1>
            <p className="lead">
              Спроси про персонажей, моды, экипировку и прогресс. Это только оболочка без
              истории и без ИИ.
            </p>
          </div>

          <div className="hints" aria-label="Быстрые подсказки">
            {suggestions.map((item) => (
              <button key={item} className="suggestion-chip" type="button">
                {item}
              </button>
            ))}
          </div>

          <section className="composer-shell" aria-label="Поле ввода сообщения">
            <form className="composer" onSubmit={(event) => event.preventDefault()}>
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Напиши сообщение"
                aria-label="Ввести сообщение"
              />

              <button className="send-button" type="submit" aria-label="Отправить сообщение">
                <img src="/icons/send.PNG" alt="" aria-hidden="true" className="send-icon" />
              </button>
            </form>

            <p className="disclaimer">Это ИИ. Он может допускать ошибки</p>
          </section>
        </section>
      </div>
    </main>
  );
}
