"use client";

import Image from "next/image";
import styles from "./adminHeaderStyles.module.css";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  File,
  User,
  Delete,
  Settings,
  LogOut,
  Activity,
} from "lucide-react";

export default function AdminHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const userName = "Kai Sotto";

  const router = useRouter();
  const [user, setUser] = useState<{
    FirstName: string;
    LastName: string;
    ProfilePicture?: string;
  } | null>(null);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const res = await fetch("/api/user/me");
  //       const data = await res.json();
  //       if (res.ok) {
  //         setUser(data);
  //       } else {
  //         console.error(data.error);
  //         router.push("/login");
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch user");
  //       router.push("/login");
  //     }
  //   };
  //   fetchUser();
  // }, [router]);

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
            href="/admin/dashboard"
            className={`${styles.sidebarLink} ${
              pathname.includes("/admin/dashboard") ? styles.activeLink : ""
            }`}
          >
            <LayoutDashboard size={18} className={styles.icon} />
            Dashboard
          </a>

          <a
            href="/admin/user-management"
            className={`${styles.sidebarLink} ${
              pathname.includes("/admin/user-management")
                ? styles.activeLink
                : ""
            }`}
          >
            <User size={18} className={styles.icon} />
            User Management
          </a>

          <a
            href="/admin/document-overview"
            className={`${styles.sidebarLink} ${
              pathname.includes("/admin/document-overview")
                ? styles.activeLink
                : ""
            }`}
          >
            <File size={18} className={styles.icon} />
            Documents Overview
          </a>

          <a
            href="/admin/deleted-documents"
            className={`${styles.sidebarLink} ${
              pathname.includes("/admin/deleted-documents")
                ? styles.activeLink
                : ""
            }`}
          >
            <Delete size={18} className={styles.icon} />
            Deleted Documents
          </a>

          <a
            href="/admin/activity-logs"
            className={`${styles.sidebarLink} ${
              pathname.includes("/admin/activity-logs") ? styles.activeLink : ""
            }`}
          >
            <Activity size={18} className={styles.icon} />
            Activity Logs
          </a>

          <a
            href="/admin/settings"
            className={`${styles.sidebarLink} ${
              pathname.includes("/admin/settings") ? styles.activeLink : ""
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
