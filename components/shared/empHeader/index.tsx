"use client";

import Image from "next/image";
import styles from "./empHeaderStyles.module.css";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ProfilePicture from "../ProfilePicture";

import {
  LayoutDashboard,
  FileText,
  Bell,
  History,
  Settings,
  LogOut,
} from "lucide-react";
export function GET() {
  const res = new Response();
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return res;
}
export default function EmpDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const router = useRouter();
  const [user, setUser] = useState<{
    FirstName: string;
    LastName: string;
    ProfilePicture?: string | null;
  } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);


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

    useEffect(() => {
    // Force refresh so it checks auth on back navigation
    window.onpageshow = function (event) {
      if (event.persisted) {
        window.location.reload();
      }
    };
  }, []);

    useEffect(() => {
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await fetch("/api/employee/notification");
      const data = await response.json();

      console.log("Raw notifications:", data);

      const mapped = (data || [])
        .map((notif: any) => {
          const id = Number(notif.NotificationID ?? notif.id);

          if (isNaN(id)) {
            console.error("❌ Invalid ID detected:", notif);
            return null;
          }

          return {
            ...notif,
            id,
            status: notif.status,
          };
        })
        .filter((notif: any) => notif !== null);

      console.log("Mapped notifications:", mapped);

      setNotifications(mapped);

      // Count unread notifications
      const unread = mapped.filter(
        (notif: any) => notif.status !== "Read"
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Run immediately
  fetchNotifications();

  // ✅ Poll every 5 seconds for updates
  const interval = setInterval(fetchNotifications, 5000);

  return () => clearInterval(interval);
}, []);


const handleLogout = async () => {
  try {
    const res = await fetch("/api/user/logout", {
      method: "POST",
    });

    if (res.ok) {
      // Clear any cached form data
      if (typeof window !== "undefined") {
        // Clear any localStorage data
        localStorage.clear();
        // Clear any sessionStorage data
        sessionStorage.clear();
      }
      
      // Force a hard navigation to login to clear all state
      window.location.href = "/login";
    } else {
      console.error("Logout failed");
      // Even if logout fails, redirect to login
      window.location.href = "/login";
    }
  } catch (err) {
    console.error("Logout error:", err);
    // Even if error occurs, redirect to login
    window.location.href = "/login";
  }
};





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
            <div className={styles.iconWrapper}>
              <Bell size={18} className={styles.icon} />
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </div>
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

  {unreadCount > 0 && (
    <span className={styles.badgeMenu}>
      {unreadCount}
    </span>
  )}
</button>

          <Image src="/dms-logo.png" alt="Logo" width={180} height={50} />
        </div>

        <div className={styles.rightWrapper}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              Welcome, {user ? `${user.FirstName} ${user.LastName}!` : ""}
            </span>

            <ProfilePicture
              profilePicture={user?.ProfilePicture}
              firstName={user?.FirstName || ""}
              lastName={user?.LastName || ""}
              className={styles.userIcon}
            />
          </div>
        </div>
      </header>
    </>
  );
}
