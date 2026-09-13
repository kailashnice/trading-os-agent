"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

const quickPrompts = [
  { label: "Pre-session check", text: "Review this pre-session plan for rule compliance." },
  { label: "Trade audit", text: "Audit this trade. Separate process quality from P&L." },
  { label: "Second-trade urge", text: "I want to take a second trade because this setup is A+." },
  { label: "Post-session review", text: "Create a concise post-session review from this journal." }
];

const systemRules = [
  { k: "Instrument", v: "XAUUSD" },
  { k: "Trades / day", v: "1" },
  { k: "Window", v: "19:30–21:30 IST" },
  { k: "Drawn stop", v: "≤ 5.0 pt" },
  { k: "Target", v: "11.5–12.0 pt" }
];

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

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

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark-inner" />
          </span>
          <div className="brand-copy">
            <p className="brand-name">Trading OS</p>
            <p className="brand-sub">Accountability Agent</p>
          </div>
        </div>
        <div className="status">
          <span className="status-dot" aria-hidden="true" />
          <span>System v2 · Live</span>
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
            {systemRules.map((rule) => (
              <div className="rule" role="listitem" key={rule.k}>
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
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => sendMessage(undefined, prompt.text)}
                      disabled={isLoading}
                    >
                      <span className="qp-label">{prompt.label}</span>
                      <span className="qp-text">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`message ${message.role}`}>
                <div className="avatar" aria-hidden="true">
                  {message.role === "user" ? "You" : "OS"}
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
                  OS
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
