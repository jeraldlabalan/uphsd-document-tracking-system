// components/Sidebar.tsx
import Link from "next/link";

import styles from "./employeeSidebar.module.css";

type SidebarProps = {
  sidebarOpen: boolean;
};

export default function Sidebar({ sidebarOpen }: SidebarProps) {
  return (
    <aside
      className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
    >
      <p className={styles.role}>👤 IT COORDINATOR</p>
      <ul>
        <li>
          <Link href="/employee/dashboard">📂 Dashboard</Link>
        </li>
        <li>
          <Link href="/employee/dashboard/employee/document">
            📄 My Documents
          </Link>
        </li>
        <li>
          <Link href="/employee/dashboard/history">🕘 History</Link>
        </li>
        <li>
          <Link href="/employee/dashboard/settings">⚙️ Settings</Link>
        </li>
      </ul>
    </aside>
  );
}
// components/shared/employeeSidebar/employeeSidebar.tsx
