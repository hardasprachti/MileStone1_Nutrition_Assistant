"use client";

import { useState } from "react";
import type { Message } from "@/types";
import Header from "./Header";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import SourcesPanel from "./SourcesPanel";
import styles from "./ChatShell.module.css";

const FALLBACK_ERROR =
  "Something went wrong reaching the assistant. Please try again in a moment.";

export default function ChatShell() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  const lastAssistantClaims = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.claims;

  async function sendMessage(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text, createdAt: Date.now() },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.ok ? data.answer : (data.error ?? FALLBACK_ERROR),
          claims: res.ok ? data.claims : [],
          createdAt: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: FALLBACK_ERROR,
          claims: [],
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.scopeBar}>
            <div className={styles.scopeInfo}>
              <span className={styles.scopeIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 3v3M12 18v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M3 12h3M18 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="3.2" />
                </svg>
              </span>
              <span className={styles.scopeLabel}>Assistant Ready</span>
              <span className={styles.scopeDivider}>•</span>
              <span className={styles.scopeMeta}>Scope: food, nutrition &amp; cooking safety</span>
            </div>
            <span className={styles.scopeBadge}>
              <span className={styles.scopeBadgeDot} aria-hidden="true" />
              No calorie, weight, or medical advice
            </span>
          </div>

          <div className={styles.body}>
            <div className={styles.mainCard}>
              <div className={styles.glow} aria-hidden="true" />
              <div className={styles.mainBody}>
                <MessageList messages={messages} isLoading={isLoading} />
                <InputBox onSend={sendMessage} disabled={isLoading} />
              </div>
            </div>
            <SourcesPanel claims={lastAssistantClaims} />
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <span>Nutrition Assistant • AI-assisted guidance, not medical advice</span>
        <span className={styles.footerBadge}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 12.5l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          Scope-limited answers
        </span>
      </footer>
    </div>
  );
}
