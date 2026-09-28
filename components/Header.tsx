import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "Assistant", active: true },
  { label: "Biometrics", active: false },
  { label: "Meal Journal", active: false },
  { label: "Sources Library", active: false },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logoTile} aria-hidden="true">
          <svg
            className={styles.logo}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              d="M20 4c-8 0-14 5-14 13 0 1.1.9 2 2 2 8 0 13-6 13-14 0-.4-.4-1-1-1Z"
              strokeLinejoin="round"
            />
            <path d="M8 19c0-6 3-10 8-12" strokeLinecap="round" />
          </svg>
        </span>
        <span className={styles.title}>Nutrition Assistant</span>

        <div className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />
          <span>AI Active</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Sections">
        {NAV_LINKS.map((link) =>
          link.active ? (
            <span key={link.label} className={styles.navLinkActive} aria-current="page">
              {link.label}
            </span>
          ) : (
            <span
              key={link.label}
              className={styles.navLink}
              aria-disabled="true"
              title="Arrives in a later milestone"
            >
              {link.label}
            </span>
          ),
        )}
      </nav>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Settings"
          title="Arrives in a later milestone"
          disabled
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 7h10M18 7h2M4 17h2M8 17h12" strokeLinecap="round" />
            <circle cx="16" cy="7" r="2.4" />
            <circle cx="6" cy="17" r="2.4" />
          </svg>
        </button>
        <span className={styles.avatar} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    </header>
  );
}
