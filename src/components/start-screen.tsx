"use client";

import { useEffect, useMemo, useState } from "react";

const quickActions = [
  "Прожарка аккаунта",
  "Контр-пики GAC",
  "Путь к Легенде",
  "Анализ модов"
];

const sidebarItems = ["История", "Настройки", "Профиль", "Выход"];

function getTelegramName() {
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const firstName = webApp?.initDataUnsafe?.user?.first_name?.trim();
  return firstName || "друг";
}

function pickGreeting(name: string) {
  const greetings = [
    "Да прибудет сила",
    "Что на душе?",
    `Сап, ${name}`,
    `Привет, ${name}`
  ];
  const index =
    [...name].reduce((sum, char) => sum + char.codePointAt(0)!, 0) % greetings.length;
  return greetings[index];
}

export function StartScreen() {
  const [name, setName] = useState("друг");
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    setName(getTelegramName());
  }, []);

  const greeting = useMemo(() => pickGreeting(name), [name]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0B0E14] text-[#E6EEF8] select-none">
      <button
        type="button"
        aria-label="Открыть меню"
        onClick={() => setSidebarOpen(true)}
        className="absolute left-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-[#00D1FF] bg-[#0B0E14] text-[#00D1FF] transition-none"
      >
        <img src="/icons/menu.PNG" alt="" aria-hidden="true" className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label="Закрыть меню"
        onClick={() => setSidebarOpen(false)}
        className={`absolute inset-0 z-30 bg-black/50 transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`absolute left-0 top-0 z-40 h-dvh w-4/5 border-r border-[#263241] bg-[#161B22] transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col gap-4 p-4 pt-6">
          <div className="rounded-[6px] border border-[#263241] bg-[#0B0E14] p-4">
            <div className="text-xs uppercase tracking-[0.35em] text-[#00D1FF]">SWGOH.AI</div>
            <div className="mt-2 text-sm text-[#A9B7C6]">Голографический терминал</div>
          </div>

          <div className="grid gap-3">
            {sidebarItems.map((item) => (
              <button
                key={item}
                type="button"
                className="flex h-14 items-center rounded-[6px] border border-[#2B3440] bg-[#10151D] px-4 text-left text-sm font-medium text-[#E6EEF8] transition-none active:border-[#00D1FF]"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col px-4 pb-4 pt-20">
        <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-widest text-[#00D1FF]">SWGOH.AI</h1>
            <p className="mt-2 text-xs text-[#A9B7C6]">Голографический терминал</p>
          </div>

          <div className="w-full space-y-3">
            <div className="rounded-[6px] border border-[#00D1FF] bg-[#0B0E14] px-4 py-3">
              <div className="text-sm text-[#E6EEF8]">{greeting}</div>
            </div>

            <form
              className="flex h-14 w-full items-center rounded-[6px] border border-[#00D1FF] bg-[#0B0E14]"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Напиши сообщение"
                aria-label="Ввести сообщение"
                className="h-full flex-1 bg-transparent px-4 text-sm text-[#E6EEF8] outline-none placeholder:text-[#627184]"
              />
              <button
                type="submit"
                aria-label="Отправить сообщение"
                className="grid h-full w-14 place-items-center rounded-r-[6px] border-l border-[#00D1FF] bg-[#10151D] transition-none"
              >
                <img src="/icons/send.PNG" alt="" aria-hidden="true" className="h-5 w-5" />
              </button>
            </form>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            {quickActions.map((item) => {
              const isActive = activeAction === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveAction(item)}
                  className={`flex aspect-square items-center justify-center rounded-[6px] border p-3 text-center text-sm font-medium leading-tight transition-none ${
                    isActive
                      ? "border-[#00D1FF] bg-[#10151D] text-[#00D1FF]"
                      : "border-[#35414F] bg-[#0F141B] text-[#E6EEF8]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
