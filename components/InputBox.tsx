"use client";

import { useState } from "react";
import styles from "./InputBox.module.css";

const QUICK_PROMPTS = [
  "What vitamins are in spinach?",
  "How long can cooked chicken stay in the fridge?",
  "Does boiling vegetables destroy nutrients?",
  "How much protein does a vegetarian adult need?",
];

type InputBoxProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export default function InputBox({ onSend, disabled }: InputBoxProps) {
  const [value, setValue] = useState("");

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.chips}>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className={styles.chip}
            onClick={() => submit(prompt)}
            disabled={disabled}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className={styles.dock}>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <input
            className={styles.input}
            type="text"
            placeholder="Ask about food, nutrition, or food safety..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            aria-label="Ask a question"
          />
          <button
            type="submit"
            className={styles.send}
            disabled={disabled || !value.trim()}
          >
            <span>Send</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" strokeLinecap="round" />
              <path d="M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        <p className={styles.disclaimer}>
          AI outputs are for informational guidance and do not replace personalized medical advice.
        </p>
      </div>
    </div>
  );
}
