"use client";

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 z-[70] h-dvh w-[85%] max-w-[320px] bg-[#2D2C2A] border-r border-white/5 flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <img src="/icons/logo.svg" alt="Logo" className="w-7 h-7" />
            <span className="text-[19px] font-medium tracking-tight text-[#E8E6E3]">
              swgoh<span className="text-[#5FA86D]">.ai</span>
            </span>
          </div>
          <button onClick={onClose} className="p-1 active:scale-90 transition-transform">
            <img src="/icons/cross.svg" alt="Close" className="w-5 h-5 opacity-60" />
          </button>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[15px] text-[#6A6965] font-medium">Чатов пока нет</span>
        </div>

        {/* User Block (Bottom) */}
        <div className="p-4">
          <div className="w-full bg-white/5 rounded-2xl p-3 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              {/* Квадрат с закругленными углами */}
              <div className="w-10 h-10 bg-[#3D3C3A] rounded-xl flex items-center justify-center">
                <img src="/icons/logo.svg" className="w-5 h-5 opacity-20 grayscale" alt="" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-medium text-[#E8E6E3]">const-name</span>
                <span className="text-[12px] text-[#E8E6E3]/40">@const=user</span>
              </div>
            </div>
            <button className="p-1 active:scale-90 transition-transform">
              <img src="/icons/dots.svg" alt="More" className="w-5 h-5 opacity-40" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
