"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type IconKey = "shield" | "scan" | "flame" | "clipboard";

const quickPrompts: { label: string; text: string; icon: IconKey }[] = [
  { label: "Pre-session check", text: "Review this pre-session plan for rule compliance.", icon: "shield" },
  { label: "Trade audit", text: "Audit this trade. Separate process quality from P&L.", icon: "scan" },
  { label: "Second-trade urge", text: "I want to take a second trade because this setup is A+.", icon: "flame" },
  { label: "Post-session review", text: "Create a concise post-session review from this journal.", icon: "clipboard" }
];

const systemRules = [
  { k: "Instrument", v: "XAUUSD" },
  { k: "Trades / day", v: "1" },
  { k: "Window", v: "19:30–21:30 IST" },
  { k: "Drawn stop", v: "≤ 5.0 pt" },
  { k: "Target", v: "11.5–12.0 pt" }
];

type Message = { role: "user" | "assistant"; content: string };

/* Custom icon set */
function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="ic-logo">
      <rect x="3.5" y="10" width="3.4" height="8" rx="1.2" fill="currentColor" opacity="0.55" className="bar b1" />
      <rect x="10.3" y="6" width="3.4" height="12" rx="1.2" fill="currentColor" className="bar b2" />
      <rect x="17.1" y="8.5" width="3.4" height="9.5" rx="1.2" fill="currentColor" opacity="0.75" className="bar b3" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.3A8 8 0 0 1 9.7 4 7.5 7.5 0 1 0 20 14.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PromptIcon({ name }: { name: IconKey }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "shield")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l7 2.5v5.4c0 4.4-3 7.6-7 9.1-4-1.5-7-4.7-7-9.1V5.5L12 3Z" {...common} />
        <path d="M9 11.8l2.1 2.1L15 9.9" {...common} />
      </svg>
    );
  if (name === "scan")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6" {...common} />
        <path d="M20 20l-4.3-4.3M11 8v6M8 11h6" {...common} />
      </svg>
    );
  if (name === "flame")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3s5 3.6 5 8.4a5 5 0 0 1-10 0c0-1.6.8-2.9 1.6-3.8.4 1 1.1 1.6 1.9 1.6 0-2.4.9-4.5 1.5-6.2Z" {...common} />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2.2" {...common} />
      <path d="M9 3.5h6v2.2H9zM8.5 10.5h7M8.5 14h7M8.5 17.5h4" {...common} />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.2" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.8 20c.7-3.7 3.6-6 7.2-6s6.5 2.3 7.2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") setTheme(current);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("trading-os-theme", next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }

  async function sendMessage(event?: FormEvent, suppliedDraft?: string) {
    event?.preventDefault();
    const content = (suppliedDraft ?? draft).trim();
    if (!content || isLoading) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The coach could not respond.");
      setMessages((current) => [...current, { role: "assistant", content: payload.answer }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const composing = event.nativeEvent.isComposing || event.keyCode === 229;
    if (event.key === "Enter" && !event.shiftKey && !composing) {
      event.preventDefault();
      sendMessage();
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="app">
      <div className="aurora" aria-hidden="true" />
      <div className="grid-veil" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <LogoMark />
          </span>
          <div className="brand-copy">
            <p className="brand-name">Trading OS</p>
            <p className="brand-sub">Accountability Agent</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={theme === "light"}
          >
            <span className="theme-icon sun">
              <SunIcon />
            </span>
            <span className="theme-icon moon">
              <MoonIcon />
            </span>
          </button>
          <div className="status">
            <span className="status-dot" aria-hidden="true" />
            <span>System v2 · Live</span>
          </div>
        </div>
      </header>

      <main className="shell">
        <section className="hero" aria-label="Overview">
          <p className="eyebrow">Process before P&amp;L</p>
          <h1>
            The discipline layer for your <span className="grad">gold execution.</span>
          </h1>
          <p className="lede">
            A strict review partner for XAUUSD. It checks the operative system, separates a compliant loss
            from a profitable violation, and never predicts the market.
          </p>

          <div className="rulestrip" role="list" aria-label="Current operative system">
            {systemRules.map((rule, i) => (
              <div className="rule" role="listitem" key={rule.k} style={{ animationDelay: `${i * 70}ms` }}>
                <span className="rule-k">{rule.k}</span>
                <span className="rule-v">{rule.v}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="coach" aria-label="Trading accountability coach">
          <div className="coach-header">
            <div className="coach-title">
              <span className="pulse" aria-hidden="true" />
              <div>
                <p className="eyebrow small">Live review</p>
                <h2>What happened?</h2>
              </div>
            </div>
            <button
              className="clear"
              onClick={() => {
                setMessages([]);
                setError("");
              }}
              disabled={!hasMessages || isLoading}
            >
              Clear session
            </button>
          </div>

          <div className="messages" aria-live="polite" ref={scrollRef}>
            {!hasMessages && (
              <div className="empty-state">
                <p className="empty-lead">
                  Paste a pre-session plan, journal entry, or trade log. The coach weighs evidence and rule
                  adherence before outcome.
                </p>
                <div className="quick-prompts">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={prompt.label}
                      onClick={() => sendMessage(undefined, prompt.text)}
                      disabled={isLoading}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="qp-icon" aria-hidden="true">
                        <PromptIcon name={prompt.icon} />
                      </span>
                      <span className="qp-copy">
                        <span className="qp-label">{prompt.label}</span>
                        <span className="qp-text">{prompt.text}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`message ${message.role}`}>
                <div className="avatar" aria-hidden="true">
                  {message.role === "user" ? <UserIcon /> : <LogoMark />}
                </div>
                <div className="bubble">
                  <p className="message-label">{message.role === "user" ? "You" : "Coach"}</p>
                  <p className="message-body">{message.content}</p>
                </div>
              </article>
            ))}

            {isLoading && (
              <article className="message assistant">
                <div className="avatar" aria-hidden="true">
                  <LogoMark />
                </div>
                <div className="bubble">
                  <p className="message-label">Coach</p>
                  <div className="typing" aria-label="Reviewing against the system">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            )}
          </div>

          <form onSubmit={(event) => sendMessage(event)}>
            <div className="composer">
              <label htmlFor="journal" className="sr-only">
                Your note
              </label>
              <textarea
                id="journal"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. I took a BE+ on my first trade and want to enter again because the second setup looks stronger."
                rows={3}
                disabled={isLoading}
              />
              <div className="composer-footer">
                <p className="hint">Never paste passwords, API keys, or broker credentials.</p>
                <button className="send" type="submit" disabled={!draft.trim() || isLoading}>
                  <span>Review</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </form>
        </section>

        <footer>Evidence-led accountability · not financial advice · current rules are the authority</footer>
      </main>
    </div>
  );
}
