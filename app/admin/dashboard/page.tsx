"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./adminDashboardStyles.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import { X, Users, FileText, School } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  summary: {
    totalUsers: number;
    totalDocs: number;
    totalDepartments: number;
    pendingSignatures: number;
  };
  statusCounts: Record<string, number>;
  charts: {
    weekly: {
      inProcess: number[];
      completed: number[];
      onHold: number[];
      approved: number[];
      awaitingCompletion: number[];
    };
    monthly: {
      inProcess: number[];
      completed: number[];
      onHold: number[];
      approved: number[];
      awaitingCompletion: number[];
    };
    yearly: {
      inProcess: number[];
      completed: number[];
      onHold: number[];
      approved: number[];
      awaitingCompletion: number[];
    };
  };
  recentUsers: Array<{
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    isActive: boolean;
    profilePicture: string;
  }>;
  recentDocuments: Array<{
    id: number;
    title: string;
    type: string;
    department: string;
    creator: string;
    status: string;
    dateCreated: string;
  }>;
  yearlyMonthlyData: Record<
    number,
    {
      inProcess: number[];
      completed: number[];
      onHold: number[];
      approved: number[];
      awaitingCompletion: number[];
    }
  >;
}

export default function AdminDashboard() {



  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    // Add CSS for spinning animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [activeChart, setActiveChart] = useState<
    "weekly" | "monthly" | "yearly" | null
  >(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAutoUpdating, setIsAutoUpdating] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // Start as null
  const [isClient, setIsClient] = useState(false); // Track if component is mounted
  const [chartLoadingStates, setChartLoadingStates] = useState({
    weekly: false,
    monthly: false,
    yearly: false,
  });

  const summaryRef = useRef<HTMLDivElement>(null);
  const weeklyRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);
  const yearlyRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = async (isAutoUpdate = false) => {
    try {
      // Always fetch data on initial load, use cache only for auto-updates if data exists
      if (isAutoUpdate && dashboardData && !isRefreshing) {
        return; // Skip auto-update if we have data and not manually refreshing
      }

      if (isAutoUpdate) {
        setIsAutoUpdating(true);
      }

      const response = await fetch("/api/admin/dashboard", {
        headers: {
          "Cache-Control": "no-cache", // Force fresh data every time
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch dashboard data:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to fetch dashboard data");
    } finally {
      if (isAutoUpdate) {
        setIsAutoUpdating(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData(); // Initial load without parameter

    // Set client-side values after mount to prevent hydration errors
    setIsClient(true);
    setSelectedYear(new Date().getFullYear());

    // Set up automatic refresh every 3 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchDashboardData(true); // Pass true for auto-update
    }, 3000); // 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);



  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    // Set loading states for each chart
    setChartLoadingStates({
      weekly: true,
      monthly: true,
      yearly: true,
    });

    try {
      await fetchDashboardData();
      setLastUpdated(new Date());
    } catch (error) {
      setError("Failed to refresh dashboard data");
    } finally {
      setIsRefreshing(false);
      // Clear loading states for all charts
      setChartLoadingStates({
        weekly: false,
        monthly: false,
        yearly: false,
      });
    }
  };

  const getSelectedContent = () => {
    const elements: HTMLElement[] = [];

    if (
      selectedDetails.includes("users") ||
      selectedDetails.includes("documents") ||
      selectedDetails.includes("departments")
    ) {
      if (summaryRef.current) elements.push(summaryRef.current);
    }
    if (selectedDetails.includes("weekly") && weeklyRef.current)
      elements.push(weeklyRef.current);
    if (selectedDetails.includes("monthly") && monthlyRef.current)
      elements.push(monthlyRef.current);
    if (selectedDetails.includes("yearly") && yearlyRef.current)
      elements.push(yearlyRef.current);

    return elements;
  };

  const handleDownload = async () => {
    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, {
      scale: 2, // High resolution
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth(); // 595.28pt
    const pageHeight = pdf.internal.pageSize.getHeight(); // 841.89pt

    // Word-like 1-inch margins (72pt)
    const marginTop = 10;
    const marginBottom = 72;
    const marginLeft = 72;
    const marginRight = 72;

    const usableWidth = pageWidth - marginLeft - marginRight;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = marginTop;

    // First page
    pdf.addImage(imgData, "PNG", marginLeft, position, usableWidth, imgHeight);
    heightLeft -= pageHeight - marginTop - marginBottom;

    // Add extra pages if needed
    while (heightLeft > 0) {
      position = marginTop - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        marginLeft,
        position,
        usableWidth,
        imgHeight
      );
      heightLeft -= pageHeight - marginTop - marginBottom;
    }

    pdf.save("admin-dashboard-report.pdf");
  };

  if (error) {
    return (
      <div>
        <AdminHeader />
        <div className={styles.container}>
          <div className={styles.contentSection}>
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Error Loading Dashboard</h3>
              <p>{error}</p>
              <button onClick={handleRefresh} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div>
        <AdminHeader />
        <div className={styles.container}>
          <div data-aos="fade-up" className={styles.contentSection}>
            <div className={styles.headerRow}>
              <h2 className={styles.pageTitle}>Admin Dashboard</h2>
            </div>
            <hr className={styles.separator} />

            {/* Status Indicators */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "1rem",
                fontSize: "14px",
                color: "#666",
              }}
            >
              {/* Auto-update indicator removed - functionality still works silently */}
            </div>

            {/* Loading Summary Cards */}
            <div className={styles.summary}>
              <div className={`${styles.card} ${styles.cyan}`}>
                <Users className={styles.icon} />
                <span className={styles.count}>...</span>
                <span>Total Active Users</span>
              </div>
              <div className={`${styles.card} ${styles.green}`}>
                <FileText className={styles.icon} />
                <span className={styles.count}>...</span>
                <span>Total Documents</span>
              </div>
              <div className={`${styles.card} ${styles.orange}`}>
                <School className={styles.icon} />
                <span className={styles.count}>...</span>
                <span>Total Active Departments</span>
              </div>
            </div>

            {/* Loading Charts */}
            <div className={styles.graphContainer}>
              {["weekly", "monthly", "yearly"].map((type) => (
                <div key={type} className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </h3>
                  <div
                    style={{
                      height: "300px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                    }}
                  >
                    Loading {type} chart...
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.graphHeader}>
              <button
                className={styles.printButton}
                onClick={() => setShowPrintModal(true)}
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, charts } = dashboardData;

  return (
    <div>
      <AdminHeader />

      {/* Loading overlay - only shows when refreshing */}
      {/* Removed loading state and loading UI */}

      {/* Print-only content */}
      <div
        id="print-template"
        ref={printRef}
        style={{
          position: "absolute",
          top: "-10000px",
          left: "0",
          width: "800px",
          padding: "1rem",
          background: "white",
          color: "black",
          zIndex: -1,
          fontSize: "12px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ marginTop: "1rem", fontWeight: 700, fontSize: "18px" }}>
            Document Tracking System Report
          </h2>
        </div>

        <div ref={summaryRef}>
          <h3
            style={{
              fontWeight: "700",
              fontSize: "16px",
              marginBottom: "1rem",
            }}
          >
            Summary
          </h3>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            {selectedDetails.includes("users") && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  minWidth: "150px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <Users size={20} />
                <div>
                  <h4
                    style={{
                      margin: "0 0 0.25rem 0",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Total Users
                  </h4>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    {summary.totalUsers}
                  </p>
                </div>
              </div>
            )}
            {selectedDetails.includes("documents") && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  minWidth: "150px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <FileText size={20} />
                <div>
                  <h4
                    style={{
                      margin: "0 0 0.25rem 0",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Total Documents
                  </h4>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    {summary.totalDocs}
                  </p>
                </div>
              </div>
            )}
            {selectedDetails.includes("departments") && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  minWidth: "150px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <School size={20} />
                <div>
                  <h4
                    style={{
                      margin: "0 0 0.25rem 0",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Total Departments
                  </h4>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    {summary.totalDepartments}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        {selectedDetails.includes("weekly") && (
          <div ref={weeklyRef} style={{ marginTop: "2rem" }}>
            <h3
              style={{
                fontWeight: "700",
                fontSize: "16px",
                marginBottom: "1rem",
              }}
            >
              Weekly Graph
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Bar
                data={{
                  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                  datasets: [
                    {
                      label: "In-Process",
                      data: charts.weekly.inProcess,
                      backgroundColor: "#FFAC1C",
                    },
                    {
                      label: "Completed",
                      data: charts.weekly.completed,
                      backgroundColor: "#50C878",
                    },
                    {
                      label: "On-Hold",
                      data: charts.weekly.onHold,
                      backgroundColor: "#F08080",
                    },
                    {
                      label: "Approved",
                      data: charts.weekly.approved,
                      backgroundColor: "#1E90FF",
                    },
                    {
                      label: "Awaiting-Completion",
                      data: charts.weekly.awaitingCompletion,
                      backgroundColor: "#9370DB",
                    },
                  ],
                }}
                options={{
                  responsive: false,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: "top" },
                  },
                }}
                width={600}
                height={300}
              />
            </div>
          </div>
        )}

        {selectedDetails.includes("monthly") && (
          <div ref={monthlyRef} style={{ marginTop: "2rem" }}>
            <h3
              style={{
                fontWeight: "700",
                fontSize: "16px",
                marginBottom: "1rem",
              }}
            >
              Monthly Graph
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Bar
                data={{
                  labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  datasets: [
                    {
                      label: "In-Process",
                      data: charts.monthly.inProcess,
                      backgroundColor: "#FFAC1C",
                    },
                    {
                      label: "Completed",
                      data: charts.monthly.completed,
                      backgroundColor: "#50C878",
                    },
                    {
                      label: "On-Hold",
                      data: charts.monthly.onHold,
                      backgroundColor: "#F08080",
                    },
                    {
                      label: "Approved",
                      data: charts.monthly.approved,
                      backgroundColor: "#1E90FF",
                    },
                    {
                      label: "Awaiting-Completion",
                      data: charts.monthly.awaitingCompletion,
                      backgroundColor: "#9370DB",
                    },
                  ],
                }}
                options={{
                  responsive: false,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: "top" },
                  },
                }}
                width={600}
                height={300}
              />
            </div>
          </div>
        )}

        {selectedDetails.includes("yearly") && isClient && (
          <div ref={yearlyRef} style={{ marginTop: "2rem" }}>
            <h3
              style={{
                fontWeight: "700",
                fontSize: "16px",
                marginBottom: "1rem",
              }}
            >
              Yearly Graph
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Bar
                data={{
                  labels: (() => {
                    // Dynamic yearly labels starting from 2025 (base year) to current year
                    const baseYear = 2025;
                    const currentYear = new Date().getFullYear();
                    const yearLabels = [];
                    for (let year = baseYear; year <= currentYear; year++) {
                      yearLabels.push(year.toString());
                    }
                    return yearLabels;
                  })(),
                  datasets: [
                    {
                      label: "In-Process",
                      data: charts.yearly.inProcess,
                      backgroundColor: "#FFAC1C",
                    },
                    {
                      label: "Completed",
                      data: charts.yearly.completed,
                      backgroundColor: "#50C878",
                    },
                    {
                      label: "On-Hold",
                      data: charts.yearly.onHold,
                      backgroundColor: "#F08080",
                    },
                    {
                      label: "Approved",
                      data: charts.yearly.approved,
                      backgroundColor: "#1E90FF",
                    },
                    {
                      label: "Awaiting-Completion",
                      data: charts.yearly.awaitingCompletion,
                      backgroundColor: "#9370DB",
                    },
                  ],
                }}
                options={{
                  responsive: false,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: "top" },
                  },
                }}
                width={600}
                height={300}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Admin Dashboard</h2>
            <div className={styles.headerButtons}>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={styles.refreshButton}
                title="Refresh Dashboard"
              >
                {isRefreshing ? (
                  <svg
                    className={styles.spinner}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="31.416"
                      strokeDashoffset="31.416"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        dur="2s"
                        values="0 31.416;15.708 15.708;0 31.416"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dashoffset"
                        dur="2s"
                        values="0;-15.708;-31.416"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 4v6h6" />
                    <path d="M23 20v-6h-6" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <hr className={styles.separator} />

          {/* Status Indicators */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "1rem",
              fontSize: "14px",
              color: "#666",
            }}
          >
            {/* Auto-update indicator removed - functionality still works silently */}
          </div>

          {/* Summary Cards */}
          <div className={styles.summary}>
            <Link href="/admin/user-management" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.cyan}`}>
                <Users className={styles.icon} />
                <span className={styles.count}>
                  {isRefreshing ? (
                    <span>...</span>
                  ) : (
                    dashboardData?.summary.totalUsers || 0
                  )}
                </span>
                <span>Total Active Users</span>
              </div>
            </Link>

            <Link href="/admin/document-overview" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.green}`}>
                <FileText className={styles.icon} />
                <span className={styles.count}>
                  {isRefreshing ? (
                    <span>...</span>
                  ) : (
                    dashboardData?.summary.totalDocs || 0
                  )}
                </span>
                <span>Total Documents</span>
              </div>
            </Link>

            <Link href="/admin/settings" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.orange}`}>
                <School className={styles.icon} />
                <span className={styles.count}>
                  {isRefreshing ? (
                    <span>...</span>
                  ) : (
                    dashboardData?.summary.totalDepartments || 0
                  )}
                </span>
                <span>Total Active Departments</span>
              </div>
            </Link>
          </div>

          {/* Charts */}
          <div className={styles.graphContainer}>
            {["weekly", "monthly", "yearly"].map((type) => {
              // Label sets
              const labels =
                type === "weekly"
                  ? ["Week 1", "Week 2", "Week 3", "Week 4"]
                  : type === "monthly"
                    ? [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ]
                    : (() => {
                        // Dynamic yearly labels starting from 2025 (base year) to current year
                        if (!isClient) return [];
                        const baseYear = 2025;
                        const currentYear = new Date().getFullYear();
                        const yearLabels = [];
                        for (let year = baseYear; year <= currentYear; year++) {
                          yearLabels.push(year.toString());
                        }
                        return yearLabels;
                      })();

              // Data sets
              const dataSet = charts[type as keyof typeof charts];
              const isChartLoading =
                chartLoadingStates[type as keyof typeof chartLoadingStates];

              // Build datasets array with new statuses
              const datasets = [
                {
                  label: "In-Process",
                  data: dataSet.inProcess,
                  backgroundColor: "#FFAC1C", // Orange
                },
                {
                  label: "Completed",
                  data: dataSet.completed,
                  backgroundColor: "#50C878", // Green
                },
                {
                  label: "On-Hold",
                  data: dataSet.onHold,
                  backgroundColor: "#F08080", // Light red
                },
                {
                  label: "Approved",
                  data: dataSet.approved,
                  backgroundColor: "#1E90FF", // Dodger blue
                },
                {
                  label: "Awaiting-Completion",
                  data: dataSet.awaitingCompletion,
                  backgroundColor: "#9370DB", // Purple
                },
              ];

              return (
                <div
                  key={type}
                  className={styles.chartCard}
                  onClick={() =>
                    setActiveChart(type as "weekly" | "monthly" | "yearly")
                  }
                >
                  <h3 className={styles.chartTitle}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </h3>
                  {isChartLoading ? (
                    <div
                      style={{
                        height: "300px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        color: "#666",
                      }}
                    >
                      Loading {type} chart...
                    </div>
                  ) : (
                    <Bar
                      data={{
                        labels,
                        datasets,
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                        },
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.graphHeader}>
            <button
              className={styles.printButton}
              onClick={() => setShowPrintModal(true)}
            >
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Chart Modal */}
      {activeChart && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <button
              className={styles.closeButton}
              onClick={() => setActiveChart(null)}
              aria-label="Close Modal"
            >
              <X size={20} />
            </button>
            <div className={styles.modalTop}>
              <h3 className={styles.modalTitle}>
                {activeChart === "yearly"
                  ? "Yearly Documents"
                  : `${activeChart.charAt(0).toUpperCase() + activeChart.slice(1)} Documents`}
              </h3>
            </div>
            <div className={styles.modalChart}>
              <Bar
                data={{
                  labels:
                    activeChart === "weekly"
                      ? ["Week 1", "Week 2", "Week 3", "Week 4"]
                      : activeChart === "monthly"
                        ? [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ]
                        : (() => {
                            // For yearly modal, match the main yearly chart (multi-year labels)
                            if (!isClient) return [];
                            const baseYear = 2025;
                            const currentYear = new Date().getFullYear();
                            const yearLabels: string[] = [];
                            for (
                              let year = baseYear;
                              year <= currentYear;
                              year++
                            ) {
                              yearLabels.push(year.toString());
                            }
                            return yearLabels;
                          })(),
                  datasets: [
                    {
                      label: "In-Process",
                      data: charts[activeChart].inProcess,
                      backgroundColor: "#FFAC1C",
                    },
                    {
                      label: "Completed",
                      data: charts[activeChart].completed,
                      backgroundColor: "#50C878",
                    },
                    {
                      label: "On-Hold",
                      data: charts[activeChart].onHold,
                      backgroundColor: "#F08080",
                    },
                    {
                      label: "Approved",
                      data: charts[activeChart].approved,
                      backgroundColor: "#1E90FF",
                    },
                    {
                      label: "Awaiting-Completion",
                      data: charts[activeChart].awaitingCompletion,
                      backgroundColor: "#9370DB",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showPrintModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCardPrint}>
            <button
              className={styles.closeButton}
              onClick={() => setShowPrintModal(false)}
              aria-label="Close Modal"
            >
              ×
            </button>
            <h3 className={styles.modalTitle}>Download Report</h3>
            <h3 style={{ textAlign: "center" }}>Select content to include:</h3>

            <div className={styles.checkboxGroup}>
              {/* ✅ Select All Checkbox */}
              <label>
                <input
                  type="checkbox"
                  checked={selectedDetails.length === 6} // 6 items total
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all
                      setSelectedDetails([
                        "users",
                        "documents",
                        "departments",
                        "weekly",
                        "monthly",
                        "yearly",
                      ]);
                    } else {
                      // Deselect all
                      setSelectedDetails([]);
                    }
                  }}
                />
                Select All
              </label>

              <label>
                <input
                  type="checkbox"
                  value="users"
                  checked={selectedDetails.includes("users")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDetails((prev) =>
                      prev.includes(value)
                        ? prev.filter((v) => v !== value)
                        : [...prev, value]
                    );
                  }}
                />
                User Summary
              </label>

              <label>
                <input
                  type="checkbox"
                  value="documents"
                  checked={selectedDetails.includes("documents")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDetails((prev) =>
                      prev.includes(value)
                        ? prev.filter((v) => v !== value)
                        : [...prev, value]
                    );
                  }}
                />
                Document Summary
              </label>

              <label>
                <input
                  type="checkbox"
                  value="departments"
                  checked={selectedDetails.includes("departments")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDetails((prev) =>
                      prev.includes(value)
                        ? prev.filter((v) => v !== value)
                        : [...prev, value]
                    );
                  }}
                />
                Department Summary
              </label>

              <label>
                <input
                  type="checkbox"
                  value="weekly"
                  checked={selectedDetails.includes("weekly")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDetails((prev) =>
                      prev.includes(value)
                        ? prev.filter((v) => v !== value)
                        : [...prev, value]
                    );
                  }}
                />
                Weekly Chart
              </label>

              <label>
                <input
                  type="checkbox"
                  value="monthly"
                  checked={selectedDetails.includes("monthly")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDetails((prev) =>
                      prev.includes(value)
                        ? prev.filter((v) => v !== value)
                        : [...prev, value]
                    );
                  }}
                />
                Monthly Chart
              </label>

              <label>
                <input
                  type="checkbox"
                  value="yearly"
                  checked={selectedDetails.includes("yearly")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDetails((prev) =>
                      prev.includes(value)
                        ? prev.filter((v) => v !== value)
                        : [...prev, value]
                    );
                  }}
                />
                Yearly Chart
              </label>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.createButton}
                onClick={() => {
                  handleDownload();
                  setShowPrintModal(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
