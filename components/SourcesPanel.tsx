import type { Claim } from "@/types";
import styles from "./SourcesPanel.module.css";

// `claims` is accepted so the prop contract is frozen ahead of Milestone 2,
// which will replace `source: null` with real citations and render them here.
type SourcesPanelProps = {
  claims?: Claim[];
};

export default function SourcesPanel({}: SourcesPanelProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>
          <span className={styles.headerIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" strokeLinejoin="round" />
              <path d="M4 19.5V20.5A2.5 2.5 0 0 0 6.5 23H20" strokeLinecap="round" />
            </svg>
          </span>
          Sources
        </span>
        <span className={styles.badge}>0 Active</span>
      </div>

      <div className={styles.empty}>
        <div className={styles.emptyIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" strokeLinejoin="round" />
            <path d="M4 19.5V20.5A2.5 2.5 0 0 0 6.5 23H20" strokeLinecap="round" />
          </svg>
        </div>
        <p className={styles.emptyTitle}>Available in Milestone 2</p>
        <p className={styles.emptyText}>
          Cited sources for each claim will appear here once retrieval is added.
        </p>
        <span className={styles.emptyPill}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
          </svg>
          Retrieval not yet connected
        </span>
      </div>
    </aside>
  );
}
