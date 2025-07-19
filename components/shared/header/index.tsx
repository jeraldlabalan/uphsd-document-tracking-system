"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./header.module.css";
import Search from "./search";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className={styles.header}>

      <div className={styles.logoWrapper}>
        <Image src="/full-logo.png" alt="Logo Icon" width={160} height={160} />
      </div>

      <div className={styles.rightWrapper}>
        <div className={styles.searchWrapper}>
          <Search />
        </div>

        <div className={styles.authWrapper}>
          <a href="/login" className={styles.authButton}>Log In</a>
          <span className={styles.divider} />
          <a href="/sign-up" className={styles.authButton}>Sign Up</a>
        </div>

        <button className={styles.menuButton} onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <a href="/login" className={styles.mobileLink}>Log In</a>
          <a href="/sign-up" className={styles.mobileLink}>Sign Up</a>
        </div>
      )}
    </header>
  );
}
