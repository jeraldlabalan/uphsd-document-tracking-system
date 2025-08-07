"use client";

import { useState, useEffect } from "react";
import styles from "./historyStyles.module.css"; // Reuse same styles
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

type DocumentVersionHistory = {
  VersionID: number;
  VersionNumber: number;
  CreatedAt: string;
  ChangeDescription: string;
  CreatedByUser: {
    FirstName: string;
    LastName: string;
  };
  Document: {
    Title: string;
    CreatedAt: string;
  };
  ChangedByName: string;
};

export default function History() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [history, setHistory] = useState<DocumentVersionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // const historyData = [
  //   {
  //     document: "Final Budget FY2024",
  //     type: "Report",
  //     sender: "Matthew",
  //     department: "Finance",
  //     date: "June 12, 2025",
  //     dueDate: "June 20, 2025",
  //     status: "Completed",
  //   },
  //   {
  //     document: "Employee Feedback Form",
  //     type: "Evaluation",
  //     sender: "Donna",
  //     department: "HR",
  //     date: "May 28, 2025",
  //     dueDate: "June 5, 2025",
  //     status: "Completed",
  //   },
  //   {
  //     document: "Training Request Memo",
  //     type: "Request",
  //     sender: "Alex",
  //     department: "Learning & Dev",
  //     date: "May 15, 2025",
  //     dueDate: "May 20, 2025",
  //     status: "Completed",
  //   },
  // ];

   useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/employee/history"); // <-- replace with your actual route
        const data = await res.json();
        console.log("Fetched history data:", data);
        if (res.ok) {
          setHistory(data);
        } else {
          console.error("Failed to fetch history:", data.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

const filtered = history.filter((item) => {
  const searchMatch =
    item.Document.Title.toLowerCase().includes(search.toLowerCase()) ||
    item.CreatedByUser?.FirstName?.toLowerCase().includes(search.toLowerCase()) ||
    item.ChangeDescription.toLowerCase().includes(search.toLowerCase());

  const typeMatch = !typeFilter || item.Document.Title === typeFilter;
  const deptMatch = !departmentFilter || item.ChangeDescription === departmentFilter;

  return searchMatch && typeMatch && deptMatch;
});

  return (
    <div>
      <EmpHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>History</h2>
          </div>

          <hr className={styles.separator} />

          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className={styles.dropdown}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Report">Report</option>
              <option value="Request">Request</option>
              <option value="Evaluation">Evaluation</option>
              <option value="Notice">Notice</option>
            </select>

            <select
              className={styles.dropdown}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Learning & Dev">Learning & Dev</option>
              <option value="IT">IT</option>
            </select>
          </div>

          <table className={styles.docTable}>
            <thead>
              <tr>
                <th>Document</th>
                <th>Changed By</th>
                <th>Description</th>
                <th>Date</th>
                <th>Version</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.Document?.Title || "Untitled"}</td>
                  <td>{entry.ChangedByName || "Unknown"}</td>
                  <td>{entry.ChangeDescription || "No Description"}</td>
                  <td>{new Date(entry.CreatedAt).toLocaleDateString()}</td>
                  <td>{entry.VersionNumber}</td>
                  <td className={styles.actions}>
                    <a href="#">View</a> 
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
