import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-[68px] z-50 transition-all duration-300 ease-in-out 
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

        {/* Navigation Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
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

        <div style={{ display: "flex", gap: 10 }}>
          <button className="px-[18px] py-[8px] rounded-lg text-[14px] bg-transparent border border-border text-text transition-colors duration-200 hover:border-purple">
            Sign in
          </button>
          <button className="px-[18px] py-[8px] rounded-lg text-[14px] font-medium bg-purple text-white border-none transition-opacity duration-200 hover:opacity-85">
            List your business
          </button>
        </div>
      </div>
    </nav>
  );
}
