"use client";

import Image from "next/image";
import styles from "./empHeaderStyles.module.css";
import Search from "../Header/search";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Bell,
  History,
  Settings,
  LogOut,
} from "lucide-react";

export default function EmpDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Dashboard");
  const userName = "Kai Sotto";
  const firstInitial = userName.charAt(0).toUpperCase();

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <Image
            src="/dms-logo.png"
            alt="Sidebar Logo"
            width={200}
            height={100}
          />
          <button className={styles.closeSidebar} onClick={toggleSidebar}>
            &times;
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <a
            href="/employee2/dashboard"
            className={`${styles.sidebarLink} ${
              activeLink === "Dashboard" ? styles.activeLink : ""
            }`}
            onClick={() => setActiveLink("Dashboard")}
          >
            <LayoutDashboard size={18} className={styles.icon} />
            Dashboard
          </a>

          <a
            href="/employee2/my-documents"
            className={`${styles.sidebarLink} ${
              activeLink === "My Documents" ? styles.activeLink : ""
            }`}
            onClick={() => setActiveLink("My Documents")}
          >
            <FileText size={18} className={styles.icon} />
            My Documents
          </a>

          <a
            href="/employee2/notification"
            className={`${styles.sidebarLink} ${
              activeLink === "Notification" ? styles.activeLink : ""
            }`}
            onClick={() => setActiveLink("Notification")}
          >
            <Bell size={18} className={styles.icon} />
            Notification
          </a>

          <a
            href="/employee2/history"
            className={`${styles.sidebarLink} ${
              activeLink === "History" ? styles.activeLink : ""
            }`}
            onClick={() => setActiveLink("History")}
          >
            <History size={18} className={styles.icon} />
            History
          </a>

          <a
            href="/employee2/settings"
            className={`${styles.sidebarLink} ${
              activeLink === "Settings" ? styles.activeLink : ""
            }`}
            onClick={() => setActiveLink("Settings")}
          >
            <Settings size={18} className={styles.icon} />
            Settings
          </a>
        </nav>

        <a
          href="/login"
          className={styles.logoutLink}
          onClick={() => setActiveLink("Logout")}
        >
          <LogOut size={18} className={styles.icon} />
          Logout
        </a>
      </aside>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <button
            className={styles.menuButton}
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
          >
            &#9776;
          </button>
          <Image src="/dms-logo.png" alt="Logo" width={180} height={50} />
        </div>

        <div className={styles.rightWrapper}>
          <Search />
          <div className={styles.userInfo}>
            <span className={styles.userName}>Welcome, {userName}</span>
            <div className={styles.userIcon}>{firstInitial}</div>
          </div>
        </div>
      </header>
    </>
  );
}
