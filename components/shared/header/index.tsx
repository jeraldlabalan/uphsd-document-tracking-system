"use client";

import Image from "next/image";
import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoWrapper}>
        <Image src="/full-logo.png" alt="Logo Icon" width={180} height={180} />
        
      </div>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search..."
          className={styles.searchInput}
        />
      </div>

          <div className={styles.authWrapper}>
        <button className={styles.authButton}>
          <a href="/login">Log In</a>
        </button>

        <span className={styles.divider} />

        <button className={styles.authButton}>
          <a href="/sign-up">Sign Up</a>
        </button>
      </div>

    </header>
  );
}
