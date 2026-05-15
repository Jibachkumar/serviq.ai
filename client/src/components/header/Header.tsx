import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-[68px] z-10 transition-all duration-300 ease-in-out 
        ${
          scrolled
            ? "bg-ink/92 backdrop-blur-[12px] border-b border-border"
            : "bg-transparent backdrop-blur-none border-b-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo Section */}
        <div>
          <span className="font-['Syne',sans-serif] text-[18px] font-extrabold tracking-[-0.02em]">
            Serviq<span className="text-purple">.ai</span>
          </span>
        </div>

        {/* Desktop Nav Navigation Links */}
        <div className="hidden items-center gap-8 lg:flex">
          {["Services", "How it works", "Pricing"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[14px] transition-colors duration-200 text-muted hover:text-text"
            >
              {l}
            </a>
          ))}
        </div>

        <div className="hidden gap-[10px] lg:flex">
          <button className="px-[18px] py-[8px] rounded-lg text-[14px] bg-transparent border border-border text-text transition-colors duration-200 hover:border-purple">
            Sign in
          </button>
          <button className="px-[18px] py-[8px] rounded-lg text-[14px] font-medium bg-purple text-white border-none transition-opacity duration-200 hover:opacity-85">
            List your business
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => {
            setTimeout(() => {
              setOpen((prev) => !prev);
            }, 200); // delay in ms
          }}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-lg border border-border
            bg-surface text-text
            lg:hidden
          "
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-[360px] rounded-l-3xl
          bg-ink/95 backdrop-blur-xl
          border-l border-border
          z-50
          transform transition-transform duration-500 ease-in-out
          lg:hidden
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Close area + content */}
        <div className="flex h-full flex-col px-5 py-6">
          {/* Close button row */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setOpen(false)}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-surface"
            >
              <X size={18} />
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-y-8 px-5 py-5">
            <div className="flex flex-col gap-5">
              {["Services", "How it works", "Pricing"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-[15px] text-muted hover:text-text transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {l}
                </a>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-auto flex flex-col gap-3">
              <button className="rounded-lg border border-border px-4 py-3 text-[14px] text-text">
                Sign in
              </button>

              <button className="rounded-lg bg-purple px-4 py-3 text-[14px] font-medium text-white">
                List your business
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 lg:hidden backdrop-blur-[1px]"
        />
      )}
    </nav>
  );
}
