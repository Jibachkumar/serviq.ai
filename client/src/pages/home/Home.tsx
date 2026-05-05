import { useEffect, useRef, useLayoutEffect, useState } from "react";
import {
  Home,
  Car,
  Sparkles,
  GraduationCap,
  Utensils,
  ShoppingBag,
  Wrench,
  Scale,
  Stethoscope,
  PartyPopper,
  Store,
  Zap,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const COLORS = {
  ink: "#0A0A0F",
  inkLight: "#13131A",
  surface: "#16161E",
  border: "#2A2A38",
  purple: "#7B6EF6",
  purpleLight: "#A99EF8",
  purpleDim: "#2D2858",
  teal: "#2DDAB4",
  tealDim: "#0D3D35",
  coral: "#FF6B6B",
  text: "#E8E6FF",
  muted: "#7A7890",
  faint: "#2E2C3A",
};

/* ─── APP INFO TITLE  ─── */
function Hero() {
  const [msgIdx, setMsgIdx] = useState(0);
  const msgs = [
    { role: "ai", text: "Hi! What service do you need today?" },
    { role: "user", text: "I need a plumber tomorrow morning" },
    {
      role: "ai",
      text: "Found 5 plumbers near Koramangala. Earliest slot is 9am. Shall I book it?",
    },
    { role: "user", text: "Yes please" },
    {
      role: "ai",
      text: "Booked! OTP sent to confirm. Rajan Plumbing — tomorrow 9am ✓",
    },
  ];

  useEffect(() => {
    if (msgIdx >= msgs.length) return;
    const t = setTimeout(
      () => setMsgIdx((i) => i + 1),
      msgIdx === 0 ? 800 : 1600,
    );
    return () => clearTimeout(t);
  }, [msgIdx]);

  return (
    <div className="relative flex items-center min-h-screen overflow-hidden pt-[68px]">
      {/* Grid background */}
      <div className="grid-pattern absolute inset-0 opacity-30" />

      {/* Orbs */}
      <div className="absolute top-[10%] left-[5%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,var(--purpleDim)_0%,transparent_70%)] opacity-50 blur-3xl animate-[orb_12s_ease-in-out_infinite] pointer-events-none" />

      <div className="absolute bottom-[5%] right-[5%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,var(--tealDim)_0%,transparent_70%)] opacity-40 animate-[orb_15s_ease-in-out_infinite_reverse] pointer-events-none" />

      <div className="relative z-0 mx-auto grid w-full max-w-[1200px] grid-cols-2 items-center gap-[80px] px-8">
        {/* Left */}
        <div>
          <div className="fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full border border-purple-dim bg-purple-dim/30 text-[12px] font-medium text-purple-light mb-[28px]">
              <div className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
              AI-powered local business platform
            </div>
          </div>

          <h1 className="fade-up [animation-delay:0.2s] text-[clamp(40px,5vw,64px)] font-extrabold leading-[1.05] mb-6">
            Your local business,{" "}
            <span className="bg-linear-to-r from-purple to-teal bg-clip-text text-transparent">
              online & automated
            </span>
          </h1>

          <p className="fade-up [animation-delay:0.3s] text-[18px] text-muted leading-[1.7] mb-[36px] max-w-[480px]">
            List your services once. Our AI handles every customer inquiry,
            booking, and follow-up — 24/7. No developer needed.
          </p>

          <div className="fade-up [animation-delay:0.4s] flex flex-wrap gap-3 mb-[48px]">
            <button className="px-[28px] py-[14px] rounded-[10px] text-[15px] font-semibold bg-purple text-white font-['Syne',sans-serif] shadow-[0_0_40px_rgba(123,110,246,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(123,110,246,0.38)] active:scale-95">
              List your business — free
            </button>
            <button className="group flex items-center gap-2 px-[28px] py-[14px] rounded-[10px] text-[15px] bg-transparent border border-border text-text transition-colors duration-200 hover:border-muted active:scale-95">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-colors duration-200"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  className="text-muted group-hover:text-text"
                />
                <path
                  d="M6 5.5l5 2.5-5 2.5V5.5z"
                  fill="currentColor"
                  className="text-muted group-hover:text-text"
                />
              </svg>
              See how it works
            </button>
          </div>

          <div className="fade-up [animation-delay:0.5s] flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            {[
              ["10 min", "to go live"],
              ["24/7", "AI coverage"],
              ["₹0", "to start"],
            ].map(([n, l]) => (
              <div key={n}>
                <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-text">
                  {n}
                </div>
                <div className="text-[12px] text-muted uppercase tracking-wider">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Chat */}
        <div className="fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="bg-ink-light border border-border rounded-[20px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5),0_0_0_1px_var(--border)] animate-[float_6s_ease-in-out_infinite]">
            {/* Chat header */}
            <div className="flex items-center gap-[10px] border-b border-border bg-surface px-[18px] py-[14px]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" fill="white" />
                  <path
                    d="M8 1v2M8 13v2M1 8h2M13 8h2"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div className="font-['Syne',sans-serif] text-[13px] font-semibold text-text">
                  Serviq AI
                </div>
                <div className="flex items-center gap-1 text-[11px] text-teal">
                  <div className="h-[5px] w-[5px] rounded-full bg-teal animate-[pulse_2s_infinite]" />
                  Always online
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[COLORS.coral, "#F5A623", COLORS.teal].map((c) => (
                  <div
                    key={c}
                    className="h-[10px] w-[10px] rounded-full opacity-70"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 min-h-[280px] flex flex-col gap-[10px]">
              {msgs.slice(0, msgIdx).map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-[slideIn_0.3s_ease_forwards]`}
                >
                  <div
                    className={`
                      max-w-[80%] px-[14px] py-[10px] text-[13px] leading-[1.5]
                      ${
                        m.role === "ai"
                          ? "bg-surface text-text border border-border rounded-[14px_14px_14px_4px]"
                          : "bg-purple text-white border-none rounded-[14px_14px_4px_14px]"
                      }
                    `}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {msgIdx < msgs.length && (
                <div className="flex gap-1 px-[14px] py-[10px] bg-surface border border-border rounded-[14px_14px_14px_4px] w-fit">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted animate-[typing_1.2s_infinite]"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border flex gap-2 bg-surface">
              <div className="flex-1 bg-faint rounded-lg px-[14px] py-2 text-[13px] text-muted border border-border outline-none">
                Ask about any service...
              </div>
              <button className="w-9 h-9 rounded-lg border-none bg-purple flex items-center justify-center transition-colors hover:bg-purple-light active:scale-95">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 7h12M8 3l5 4-5 4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── BUSINESS TYPES ─── */
function BusinessStrip() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const children = Array.from(containerRef.current.children);
      const halfIndex = children.length / 2;

      // The distance we need to move is the starting position of the
      // first element in the SECOND set.
      const firstItemOfSecondSet = children[halfIndex] as HTMLElement;
      const firstItemOfFirstSet = children[0] as HTMLElement;

      if (firstItemOfSecondSet && firstItemOfFirstSet) {
        // This gives us the exact distance between the start of the list
        // and the start of the duplicate list, including all gaps.
        const distanceToMove =
          firstItemOfSecondSet.offsetLeft - firstItemOfFirstSet.offsetLeft;
        setWidth(distanceToMove);
      }
    });
  }, []);

  const types = [
    { name: "Home services", color: COLORS.purple, icon: Home },
    { name: "Automotive", color: COLORS.coral, icon: Car },
    { name: "Beauty & salon", color: "#F472B6", icon: Sparkles },
    { name: "Education", color: COLORS.teal, icon: GraduationCap },
    { name: "Food & catering", color: "#F59E0B", icon: Utensils },
    { name: "Ecommerce", color: COLORS.purpleLight, icon: ShoppingBag },
    { name: "Repairs", color: "#60A5FA", icon: Wrench },
    { name: "Legal & finance", color: "#34D399", icon: Scale },
    { name: "Healthcare", color: "#FB7185", icon: Stethoscope },
    { name: "Events", color: "#A78BFA", icon: PartyPopper },
  ];

  return (
    <div className="relative w-full overflow-x-hidden pt-14 overflow-hidden">
      {/* 1. Gradient Overlays for "Fade" effect */}
      <div className="absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-ink to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-ink to-transparent z-10" />
      <motion.div
        ref={containerRef}
        className="flex gap-[27px]"
        animate={width > 0 ? { x: [0, -width] } : {}}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 30,
          ease: "linear",
        }}
      >
        {[...types, ...types].map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={`${t.name}-${i}`}
              className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface text-sm text-muted cursor-pointer"
              style={{ ["--hover-color" as any]: `${t.color}80` }}
            >
              <Icon
                size={16}
                strokeWidth={2}
                style={{ color: t.color }}
                className="flex-shrink-0"
              />
              <span className="font-dm whitespace-nowrap">{t.name}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ─── REGISTER INFO ─── */
function CTA() {
  return (
    <section className="relative overflow-hidden px-8 py-[100px] text-center">
      {/* Radial Glow Background */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse, var(--purpleDim)80 0%, transparent 70%)",
        }}
      />

      <div className="relative z-0">
        <h2 className="mb-4 text-[clamp(32px,5vw,52px)] leading-tight font-bold">
          Bring your local business online
          <br />
          <span style={{ color: COLORS.purple }}>today — for free</span>
        </h2>

        <p className="mx-auto mb-10 max-w-[440px] text-base text-muted">
          No credit card. No developer. No technical knowledge. Just your
          business name and the services you offer.
        </p>

        <div className="mx-auto flex max-w-[500px] gap-2.5 justify-center">
          <input
            type="text"
            placeholder="Your business email"
            className="flex-1 rounded-[10px] border border-border bg-ink-light px-[18px] py-[13px] text-sm text-text outline-hidden transition-colors focus:border-purple"
          />

          <button
            style={{ background: COLORS.purple }}
            className="rounded-[10px] px-6 py-[13px] font-sans-serif text-sm font-medium whitespace-nowrap text-white shadow-[0_0_30px_rgba(105,92,224,0.25)] transition-all hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
          >
            Get started free →
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── OWNER & CUSTOMER INFO ─── */
function SplitSection() {
  return (
    <section
      style={{ padding: "100px 2rem", maxWidth: 1200, margin: "0 auto" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
        {/* For business owners */}
        <div className="relative overflow-hidden rounded-[24px] border border-border bg-ink-light p-10">
          {/* Glow Effect */}
          <div
            className="absolute top-0 right-0 h-[200px] w-[200px]"
            style={{
              background: `radial-gradient(circle, ${COLORS.purpleDim}60 0%, transparent 70%)`,
            }}
          />

          {/* Badge */}
          <div className="mb-5 inline-block rounded-md border border-purple/20 bg-purple-dim/40 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-purple-light">
            For business owners
          </div>

          <h2 className="relative mb-4 text-[28px] leading-tight">
            List once, let AI do the rest
          </h2>

          <p className="mb-7 text-sm leading-[1.7] text-muted">
            Add your services and pricing. Your AI assistant becomes a 24/7
            customer rep — answering questions, booking appointments, and
            building your customer base automatically.
          </p>

          {/* Features List */}
          <div className="space-y-3">
            {[
              "No website or developer needed",
              "AI handles queries around the clock",
              "Bookings land straight in your dashboard",
              "Customer records built automatically",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2.5 text-sm text-text"
              >
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-purple/60 bg-purple-dim/60">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path
                      d="M1.5 4l1.8 1.8 3.2-3.2"
                      stroke="currentColor"
                      className="text-purple-light"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>

          {/* Mini Dashboard */}
          <div className="mt-10 rounded-[14px] border border-border bg-surface p-4">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="font-syne text-[13px] font-semibold">
                Today's bookings
              </span>
              <span className="rounded-full bg-teal-dim px-2 py-0.5 text-[11px] text-teal">
                Live
              </span>
            </div>

            {/* Stats Grid */}
            <div className="mb-3.5 grid grid-cols-3 gap-2">
              {[
                ["12", "Bookings"],
                ["8", "New leads"],
                ["₹6.4k", "Revenue"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-xl border border-border bg-faint px-3 py-2.5"
                >
                  <div className="font-syne text-lg font-bold">{v}</div>
                  <div className="text-[10px] text-muted">{l}</div>
                </div>
              ))}
            </div>

            {/* Booking Rows */}
            <div className="space-y-1.5">
              {[
                ["Priya Sharma", "Cleaning · 3pm", "confirmed"],
                ["Rahul Das", "Plumbing · 5pm", "pending"],
              ].map(([n, s, st]) => (
                <div
                  key={n}
                  className="flex items-center justify-between rounded-lg border border-border bg-faint px-2.5 py-2"
                >
                  <div>
                    <div className="text-[12px] font-medium">{n}</div>
                    <div className="text-[11px] text-muted">{s}</div>
                  </div>
                  <div
                    className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${
                      st === "confirmed"
                        ? "bg-teal-dim text-teal"
                        : "bg-purple-dim/40 text-purple-light"
                    }`}
                  >
                    {st}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* For customers */}
        <div className="relative overflow-hidden rounded-[24px] border border-border bg-ink-light p-10">
          {/* Glow Effect */}
          <div
            className="absolute top-0 right-0 h-[200px] w-[200px]"
            style={{
              background: `radial-gradient(circle, ${COLORS.tealDim}60 0%, transparent 70%)`,
            }}
          />

          {/* Badge */}
          <div className="mb-5 inline-block rounded-md border border-teal/30 bg-teal-dim/50 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-teal">
            For customers
          </div>

          <h2 className="relative mb-4 text-[28px] leading-tight">
            Book any service, just by chatting
          </h2>

          <p className="mb-7 text-sm leading-[1.7] text-muted">
            No forms, no phone calls, no waiting on hold. Tell the AI what you
            need in plain language and it finds the right local business and
            confirms your booking.
          </p>

          {/* Features List */}
          <div className="space-y-3">
            {[
              "Find local services instantly",
              "Book in under 60 seconds",
              "OTP verified — secure booking",
              "Full history, always accessible",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2.5 text-sm text-text"
              >
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-teal/50 bg-teal-dim/50">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path
                      d="M1.5 4l1.8 1.8 3.2-3.2"
                      stroke="currentColor"
                      className="text-teal"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>

          {/* Mobile Chat Mockup */}
          <div className="mt-7 overflow-hidden rounded-[14px] border border-border bg-surface">
            {/* Chat Header */}
            <div className="flex items-center gap-2.5 border-b border-border bg-faint px-4 py-3">
              <div className="h-[30px] w-[30px] rounded-lg bg-gradient-to-br from-purple to-teal" />
              <div>
                <div className="font-syne text-[12px] font-semibold">
                  Serviq AI
                </div>
                <div className="text-[10px] text-teal">● Online</div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex flex-col gap-2 p-3.5">
              {[
                { r: "ai", t: "What service do you need?" },
                { r: "user", t: "Electrician at home today" },
                {
                  r: "ai",
                  t: "3 electricians available near you. Pick a time?",
                },
                { r: "user", t: "4pm works" },
                { r: "ai", t: "Confirmed! OTP sent to your number ✓" },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.r === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 text-[12px] ${
                      m.r === "ai"
                        ? "rounded-t-xl rounded-br-xl rounded-bl-[3px] border border-border bg-faint text-text"
                        : "rounded-t-xl rounded-bl-xl rounded-br-[3px] bg-purple text-white"
                    }`}
                  >
                    {m.t}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "List your business",
      desc: "Add services, pricing, and availability. No tech skills needed — takes under 10 minutes.",
      color: COLORS.purple,
      icon: Store,
    },
    {
      n: "02",
      title: "AI goes live instantly",
      desc: "Your dedicated AI assistant is ready to chat with customers the moment you publish.",
      color: COLORS.purpleLight,
      icon: Zap,
    },
    {
      n: "03",
      title: "Customers chat & book",
      desc: "AI collects details, verifies identity via OTP, and locks in confirmed appointments.",
      color: COLORS.teal,
      icon: MessageSquare,
    },
    {
      n: "04",
      title: "You just show up",
      desc: "See bookings in your dashboard. The AI handled everything — you just deliver the service.",
      color: COLORS.teal,
      icon: CheckCircle,
    },
  ];

  return (
    <section
      style={{
        padding: "100px 2rem",
        background: COLORS.inkLight,
        borderTop: `1px solid ${COLORS.border}`,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="mb-16 text-center">
          {/* Main Heading */}
          <h2 className="mb-3.5 text-[40px] leading-tight font-bold">
            Simple for owners,{" "}
            <span style={{ color: COLORS.purple }}>magical for customers</span>
          </h2>

          {/* Description */}
          <p className="mx-auto max-w-[500px] text-[16px] text-muted">
            No complexity, no learning curve. Your business goes digital in
            minutes.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-0.5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className={`
                relative overflow-hidden border border-border px-7 py-8 transition-transform duration-200 hover:-translate-y-1
                ${i % 2 === 0 ? "bg-surface" : "bg-faint"}
                ${i === 0 ? "rounded-l-2xl" : ""}
                ${i === 3 ? "rounded-r-2xl" : ""}
              `}
              >
                {/* Background Number */}
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -10,
                    fontFamily: "Syne, sans-serif",
                    fontSize: 80,
                    fontWeight: 800,
                    color: s.color + "10",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  {s.n}
                </div>

                {/* Icon Container */}
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-current/30 shadow-lg"
                  style={{ backgroundColor: `${s.color}20`, color: s.color }}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="mb-2.5 font-syne text-base font-bold">
                  {s.title}
                </div>

                <div className="text-[13px] leading-[1.65] text-muted">
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES ─── */
function Features() {
  const features = [
    {
      icon: "⚡",
      title: "Always-on AI",
      desc: "Customer messages at 2am? AI responds instantly. Never miss a booking because you were asleep.",
      color: COLORS.purple,
    },
    {
      icon: "🔒",
      title: "OTP verification",
      desc: "Every booking confirmed with OTP. Reduces no-shows and ensures committed, verified customers.",
      color: COLORS.teal,
    },
    {
      icon: "🧠",
      title: "Customer memory",
      desc: "Returning customers get greeted by name. AI remembers past bookings and preferences.",
      color: COLORS.purpleLight,
    },
    {
      icon: "📱",
      title: "WhatsApp ready",
      desc: "Your AI works where your customers are. WhatsApp integration — the channel every local business needs.",
      color: "#25D366",
    },
    {
      icon: "🔄",
      title: "Rebooking reminders",
      desc: "AI reminds customers when it's time to rebook. Automatic recurring revenue for your business.",
      color: COLORS.coral,
    },
    {
      icon: "📈",
      title: "Business analytics",
      desc: "See which services sell, busiest days, and customers at risk of churning — all in one view.",
      color: "#F59E0B",
    },
  ];

  return (
    <section
      style={{ padding: "100px 2rem", maxWidth: 1200, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <h2 style={{ fontSize: 40, marginBottom: 14 }}>
          Everything your business needs
          <br />
          <span style={{ color: COLORS.purple }}>to grow on autopilot</span>
        </h2>
        <p style={{ fontSize: 16, color: COLORS.muted }}>
          Features that actually matter for local businesses
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            style={
              {
                "--feature-color": f.color,
              } as React.CSSProperties
            }
            className="group cursor-default rounded-2xl border border-border bg-ink-light p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--feature-color)]/40"
          >
            <div className="mb-4 text-[28px]">{f.icon}</div>
            <div className="mb-2 font-syne text-base font-bold">{f.title}</div>
            <div className="text-[13px] leading-[1.65] text-muted">
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── PRICING ─── */
function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      sub: "forever",
      desc: "Get your business online",
      features: [
        "1 service listing",
        "AI chat assistant",
        "20 bookings/month",
        "Basic dashboard",
      ],
      cta: "Get started",
      featured: false,
    },
    {
      name: "Growth",
      price: "₹999",
      sub: "/month",
      desc: "Never miss a booking again",
      features: [
        "10 service listings",
        "Unlimited bookings",
        "Customer records & history",
        "OTP verification",
        "Rebooking reminders",
        "WhatsApp integration",
      ],
      cta: "Start free trial",
      featured: true,
    },
    {
      name: "Pro",
      price: "₹2,499",
      sub: "/month",
      desc: "Grow your revenue on autopilot",
      features: [
        "Unlimited listings",
        "Multi-location support",
        "Advanced analytics",
        "Custom AI persona",
        "Upselling AI",
        "Priority support",
      ],
      cta: "Contact us",
      featured: false,
    },
  ];

  return (
    <section
      style={{
        padding: "100px 2rem",
        background: COLORS.inkLight,
        borderTop: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="mx-auto max-w-[1000px]">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-3.5 text-4xl font-bold">
            Simple pricing,{" "}
            <span style={{ color: COLORS.purple }}>real results</span>
          </h2>
          <p className="text-base text-muted">
            ₹999/month is less than the value of 2 missed bookings. That's the
            math.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`
                relative rounded-[20px] bg-surface p-8 transition-all duration-200
                ${
                  p.featured
                    ? "scale-103 border-2 border-purple shadow-[0_0_60px_rgba(105,92,224,0.12)]"
                    : "border border-border"
                }
              `}
            >
              {/* Badge */}
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-purple px-4 py-1 text-[11px] font-semibold text-white">
                  Most popular
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-2 font-syne text-sm font-semibold text-muted">
                {p.name}
              </div>

              {/* Pricing */}
              <div className="mb-1 flex items-baseline gap-1">
                <span className="font-syne text-[36px] font-extrabold leading-tight">
                  {p.price}
                </span>
                <span className="text-[13px] text-muted">{p.sub}</span>
              </div>

              <div className="mb-6 text-[13px] leading-relaxed text-muted">
                {p.desc}
              </div>

              {/* Divider */}
              <div className="mb-5 h-px bg-border" />

              {/* Features List */}
              <div className="mb-6 flex flex-col gap-2.5">
                {p.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 text-[13px] text-text"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle
                        cx="7"
                        cy="7"
                        r="6"
                        fill={p.featured ? COLORS.purpleDim : COLORS.faint}
                      />
                      <path
                        d="M4 7l2 2 4-4"
                        stroke={p.featured ? COLORS.purpleLight : COLORS.muted}
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`
                w-full rounded-[10px] py-3 font-syne text-sm font-semibold transition-opacity hover:opacity-80
                ${
                  p.featured
                    ? "bg-purple text-white"
                    : "border border-border text-text bg-transparent"
                }
              `}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${COLORS.border}`,
        padding: "28px 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: COLORS.inkLight,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 800,
          fontSize: 16,
        }}
      >
        Serviq<span style={{ color: COLORS.purple }}>.ai</span>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {["Privacy", "Terms", "Support", "Blog"].map((l) => (
          <a
            key={l}
            href="#"
            style={{
              fontSize: 13,
              color: COLORS.muted,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.muted)}
          >
            {l}
          </a>
        ))}
      </div>
      <div style={{ fontSize: 12, color: COLORS.muted }}>© 2025 Serviq.ai</div>
    </footer>
  );
}

/* ─── APP ─── */
export default function HomePage() {
  return (
    <div>
      <Hero />
      <div
        style={{
          background: COLORS.inkLight,
        }}
      >
        <BusinessStrip />
        <CTA />
      </div>

      <SplitSection />
      <HowItWorks />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}
