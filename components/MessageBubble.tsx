import type { Message } from "@/types";
import styles from "./MessageBubble.module.css";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`${styles.row} ${isUser ? styles.userRow : styles.assistantRow}`}>
      <div className={styles.meta}>
        {isUser ? (
          <>
            <span>You</span>
            <span>•</span>
            <span>{formatTime(message.createdAt)}</span>
          </>
        ) : (
          <>
            <span className={styles.avatar} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  d="M20 4c-8 0-14 5-14 13 0 1.1.9 2 2 2 8 0 13-6 13-14 0-.4-.4-1-1-1Z"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.senderName}>Nutrition Assistant</span>
            <span>•</span>
            <span>{formatTime(message.createdAt)}</span>
          </>
        )}
      </div>

      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
        <p>{message.content}</p>

        {!isUser && message.claims && message.claims.length > 0 && (
          <div className={styles.claims}>
            <span className={styles.claimsLabel}>Key claims</span>
            {message.claims.map((claim, i) => (
              <div className={styles.claimItem} key={i}>
                <span className={styles.claimDot} aria-hidden="true" />
                <span className={styles.claimText}>{claim.claim_text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
