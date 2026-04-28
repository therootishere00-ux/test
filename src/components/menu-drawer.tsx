"use client";

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const menuItems = [
  { label: "Диалог", icon: "/icons/chat.PNG" },
  { label: "История", icon: "/icons/history.PNG" },
  { label: "Разбор аккаунта", icon: "/icons/account.PNG", badge: "Новое" },
  { label: "Настройки", icon: "/icons/settings.PNG" }
];

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Закрыть меню"
        onClick={onClose}
        className={`absolute inset-0 z-30 bg-[#171717]/8 backdrop-blur-[4px] transition-all duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`absolute left-0 top-0 z-40 h-dvh w-[84%] max-w-[340px] bg-[#FBFAF7] px-5 pb-6 pt-5 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full bg-[#F4F1EB]"
          >
            <img src="/icons/close.PNG" alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
          </button>
          <div className="w-11" />
        </div>

        <div className="flex items-center gap-4 pb-8 pt-8">
          <img
            src="/icons/applogo.PNG"
            alt=""
            aria-hidden="true"
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <div className="text-[26px] font-semibold tracking-[-0.04em] text-[#39704E]">swgoh.ai</div>
            <div className="mt-1 text-sm text-[#8C867D]">Твой проводник в SWGOH</div>
          </div>
        </div>

        <div className="space-y-2.5">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`flex h-14 w-full items-center justify-between rounded-[18px] px-4 text-left text-base font-medium text-[#222222] ${
                item.label === "Диалог" ? "bg-[#FFFFFF]" : "bg-transparent"
              }`}
            >
              <span className="flex items-center gap-3">
                <img src={item.icon} alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </span>
              {item.badge ? (
                <span className="rounded-full bg-[#EEF3E7] px-3 py-1 text-xs font-medium text-[#6D7F5C]">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="absolute bottom-8 left-5 right-5 rounded-[22px] bg-[#F3F5EA] px-5 py-5">
          <p className="text-[15px] leading-8 text-[#3D3D3D]">
            Страх ведёт к злости.
            <br />
            Злость ведёт к ненависти.
            <br />
            Ненависть ведёт к страданиям.
          </p>
          <p className="mt-3 text-right text-[15px] font-medium text-[#5F6A4C]">— Йода</p>
        </div>
      </aside>
    </>
  );
}
