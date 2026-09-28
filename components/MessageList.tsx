"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import MessageBubble from "./MessageBubble";
import bubbleStyles from "./MessageBubble.module.css";
import styles from "./MessageList.module.css";

type MessageListProps = {
  messages: Message[];
  isLoading?: boolean;
};

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={styles.list}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M20 4c-8 0-14 5-14 13 0 1.1.9 2 2 2 8 0 13-6 13-14 0-.4-.4-1-1-1Z" strokeLinejoin="round" />
              <path d="M8 19c0-6 3-10 8-12" strokeLinecap="round" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Ask a nutrition question</p>
          <p className={styles.emptyText}>
            Try asking about nutrients, food safety, or cooking methods — for example,
            &ldquo;What vitamins are in spinach?&rdquo;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className={`${bubbleStyles.row} ${bubbleStyles.assistantRow}`}>
          <div className={`${bubbleStyles.bubble} ${bubbleStyles.assistantBubble}`}>
            <div className={bubbleStyles.thinking}>
              <span className={bubbleStyles.thinkingDot} />
              <span className={bubbleStyles.thinkingDot} />
              <span className={bubbleStyles.thinkingDot} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
