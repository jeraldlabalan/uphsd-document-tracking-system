"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./employee.module.css";
import EmployeeSidebar from "@/components/shared/employeeSidebar/employeeSidebar";
import EmployeeHeader from "@/components/shared/employeeHeader/employeeHeader";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  type RecentDocument = {
    RequestID: number;
    Document: {
      Title: string;
      Department?: {
        Name: string;
      };
    };
    User: {
      FullName: string;
    };
    RequestedAt: string;
    Priority: string;
    Status: {
      StatusName: string;
    };
  };

  const [dashboardData, setDashboardData] = useState<{
    pendingSignatures: number;
    inProcess: number;
    completed: number;
    newRequests: number;
    recentDocuments: RecentDocument[];
  }>({
    pendingSignatures: 0,
    inProcess: 0,
    completed: 0,
    newRequests: 0,
    recentDocuments: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/employee/dashboard");
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <Head>
        <title className={styles.title}>Dashboard</title>
      </Head>

      <EmployeeHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className={styles.container}>
        <EmployeeSidebar sidebarOpen={sidebarOpen} />
        <main className={styles.main}>
          <h2>Dashboard</h2>

          <div className={styles.cards}>
            <div className={`${styles.card} ${styles.red}`}>
              <span className={styles.count}>
                {dashboardData.pendingSignatures}
              </span>
              <p>Pending Signatures</p>
            </div>
            <div className={`${styles.card} ${styles.blue}`}>
              <span className={styles.count}>{dashboardData.inProcess}</span>
              <p>In Process</p>
            </div>
            <div className={`${styles.card} ${styles.green}`}>
              <span className={styles.count}>{dashboardData.completed}</span>
              <p>Completed</p>
            </div>
            <div className={`${styles.card} ${styles.orange}`}>
              <span className={styles.count}>{dashboardData.newRequests}</span>
              <p>New Request</p>
            </div>
          </div>

          <h3 className={styles.recentTitle}>Recent Documents</h3>
          <div className={styles.documentList}>
            {dashboardData.recentDocuments.map((req) => (
              <div key={req.RequestID} className={styles.documentCard}>
                <div>
                  <strong>{req.Document.Title}</strong>
                  <p>To: {req.User.FullName}</p>
                  <p>Department: {req.Document.Department?.Name}</p>
                </div>
                <div>
                  <p>
                    Date Received: {new Date(req.RequestedAt).toDateString()}
                  </p>
                  <p>Priority: {req.Priority}</p>
                  <span className={styles.pending}>
                    {req.Status.StatusName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
