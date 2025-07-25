"use client";

import styles from "./employeeHeader.module.css";

type HeaderProps = {
  onToggleSidebar: () => void;
};

export default function EmployeeHeader({ onToggleSidebar }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <img src="/dms-logo.png" alt="Logo" className={styles.logo} />
      </div>

      <div className={styles.headerRight}>
        <span>Welcome, Kurt Macaranas</span>
        <div>
          <img src="/profile.png" alt="Profile" className={styles.profilePic} />
        </div>

        {/* Hamburger Button */}
        <button className={styles.hamburger} onClick={onToggleSidebar}>
          ☰
        </button>
      </div>
    </header>
  );
}
