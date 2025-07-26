"use client";

import { useState, useEffect } from "react";
import styles from "./historyStyles.module.css"; // Reuse same styles
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

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

  const historyData = [
    {
      document: "Final Budget FY2024",
      type: "Report",
      sender: "Matthew",
      department: "Finance",
      date: "June 12, 2025",
      dueDate: "June 20, 2025",
      status: "Completed",
    },
    {
      document: "Employee Feedback Form",
      type: "Evaluation",
      sender: "Donna",
      department: "HR",
      date: "May 28, 2025",
      dueDate: "June 5, 2025",
      status: "Completed",
    },
    {
      document: "Training Request Memo",
      type: "Request",
      sender: "Alex",
      department: "Learning & Dev",
      date: "May 15, 2025",
      dueDate: "May 20, 2025",
      status: "Completed",
    },
  ];

  const filtered = historyData.filter((item) => {
    const searchMatch =
      item.document.toLowerCase().includes(search.toLowerCase()) ||
      item.sender.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());

    const typeMatch = !typeFilter || item.type === typeFilter;
    const deptMatch = !departmentFilter || item.department === departmentFilter;

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
                <th>Sent By</th>
                <th>Department</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.document}</td>
                  <td>{entry.sender}</td>
                  <td>{entry.department}</td>
                  <td>{entry.date}</td>
                  <td>{entry.dueDate}</td>
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
