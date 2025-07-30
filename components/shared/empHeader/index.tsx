"use client";

import Image from "next/image";
import styles from "./empHeaderStyles.module.css";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
  const pathname = usePathname();

  const router = useRouter();
  const [user, setUser] = useState<{
    FirstName: string;
    LastName: string;
    ProfilePicture?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          console.error(data.error);
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch user");
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = () => {
    document.cookie =
      "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  const firstInitial = user?.FirstName?.charAt(0).toUpperCase() || "U";

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
              pathname.includes("/employee2/dashboard") ? styles.activeLink : ""
            }`}
          >
            <LayoutDashboard size={18} className={styles.icon} />
            Dashboard
          </a>

          <a
            href="/employee2/documents"
            className={`${styles.sidebarLink} ${
              pathname.includes("/employee2/documents") ? styles.activeLink : ""
            }`}
          >
            <FileText size={18} className={styles.icon} />
            Documents
          </a>

          <a
            href="/employee2/notification"
            className={`${styles.sidebarLink} ${
              pathname.includes("/employee2/notification")
                ? styles.activeLink
                : ""
            }`}
          >
            <Bell size={18} className={styles.icon} />
            Notification
          </a>

          <a
            href="/employee2/history"
            className={`${styles.sidebarLink} ${
              pathname.includes("/employee2/history") ? styles.activeLink : ""
            }`}
          >
            <History size={18} className={styles.icon} />
            History
          </a>

          <a
            href="/employee2/settings"
            className={`${styles.sidebarLink} ${
              pathname.includes("/employee2/settings") ? styles.activeLink : ""
            }`}
          >
            <Settings size={18} className={styles.icon} />
            Settings
          </a>
        </nav>

        <a href="/login" className={styles.logoutLink} onClick={handleLogout}>
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
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              Welcome, {user ? `${user.FirstName} ${user.LastName}!` : ""}
            </span>

            <div className={styles.userIcon}>{firstInitial}</div>
          </div>
        </div>
      </header>
    </>
  );
}
