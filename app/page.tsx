"use client";

import { FormEvent, useState } from "react";

const quickPrompts = [
  "Review this pre-session plan for rule compliance.",
  "Audit this trade. Separate process quality from P&L.",
  "I want to take a second trade because this setup is A+.",
  "Create a concise post-session review from this journal."
];

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">TRADING OS · ACCOUNTABILITY AGENT</p>
        <h1>Process before P&amp;L.</h1>
        <p className="lede">A strict review partner for your XAUUSD execution. It checks the current system, distinguishes a compliant loss from a profitable violation, and does not predict trades.</p>
        <div className="rules"><span>1 trade</span><span>Gold only</span><span>19:30–21:30 IST</span><span>Draw 5.0</span><span>Target 11.5–12.0</span></div>
      </section>

      <section className="coach" aria-label="Trading accountability coach">
        <div className="coach-header">
          <div><p className="eyebrow">LIVE REVIEW</p><h2>What happened?</h2></div>
          <button className="clear" onClick={() => { setMessages([]); setError(""); }} disabled={!messages.length || isLoading}>Clear session</button>
        </div>

        {!messages.length && (
          <div className="empty-state">
            <p>Paste a pre-session plan, journal entry, trade log, or concern. The coach evaluates evidence and rule adherence before outcome.</p>
            <div className="quick-prompts">
              {quickPrompts.map((prompt) => <button key={prompt} onClick={() => sendMessage(undefined, prompt)} disabled={isLoading}>{prompt}</button>)}
            </div>
          </div>
        )}

        <div className="messages" aria-live="polite">
          {messages.map((message, index) => (
            <article key={`${message.role}-${index}`} className={`message ${message.role}`}>
              <p className="message-label">{message.role === "user" ? "YOU" : "COACH"}</p>
              <p>{message.content}</p>
            </article>
          ))}
          {isLoading && <article className="message assistant"><p className="message-label">COACH</p><p>Reviewing against the system…</p></article>}
        </div>

        <form onSubmit={(event) => sendMessage(event)}>
          <label htmlFor="journal">Your note</label>
          <textarea id="journal" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Example: I took a BE+ on my first trade and want to enter again because the second setup looks stronger." rows={6} disabled={isLoading} />
          <div className="form-footer"><p>Do not paste account passwords, API keys, or broker credentials.</p><button className="send" type="submit" disabled={!draft.trim() || isLoading}>Review note</button></div>
          {error && <p className="error" role="alert">{error}</p>}
        </form>
      </section>

      <footer>Evidence-led accountability · not financial advice · current rules are the authority</footer>
    </main>
  );
}
