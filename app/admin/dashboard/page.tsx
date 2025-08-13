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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const [activeChart, setActiveChart] = useState<"weekly" | "monthly" | "yearly" | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);
  const weeklyRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);
  const yearlyRef = useRef<HTMLDivElement>(null);

  const printRef = useRef<HTMLDivElement>(null);




const weeklyData = {
  inProcess:          [5, 4, 6, 3, 7, 2, 1],  
  completed:          [10, 12, 9, 11, 13, 8, 6],
  onHold:             [1, 0, 2, 1, 0, 1, 1],
  approved:           [2, 3, 1, 4, 2, 3, 2],
  awaitingCompletion: [1, 1, 2, 0, 1, 2, 1],
};

const monthlyData = {
  inProcess:          [12, 14, 11, 13, 9, 15, 10, 12, 11, 13, 14, 10], 
  completed:          [30, 32, 28, 31, 26, 34, 29, 30, 31, 33, 32, 30],
  onHold:             [3, 2, 4, 3, 5, 2, 4, 3, 2, 4, 3, 5],
  approved:           [5, 4, 6, 5, 7, 4, 6, 5, 4, 7, 6, 5],
  awaitingCompletion: [2, 3, 1, 2, 3, 2, 1, 2, 3, 1, 2, 3],
};

const yearlyData = {
  inProcess:          [120], 
  completed:          [340],
  onHold:             [40],
  approved:           [60],
  awaitingCompletion: [25],
};





  const weeklyChartRef = useRef<any>(null);
const monthlyChartRef = useRef<any>(null);
const yearlyChartRef = useRef<any>(null);

const [weeklyChartImg, setWeeklyChartImg] = useState<string | null>(null);
const [monthlyChartImg, setMonthlyChartImg] = useState<string | null>(null);
const [yearlyChartImg, setYearlyChartImg] = useState<string | null>(null);

const prepareChartImages = () => {
  if (weeklyChartRef.current) {
    setWeeklyChartImg(weeklyChartRef.current.canvas.toDataURL());
  }
  if (monthlyChartRef.current) {
    setMonthlyChartImg(monthlyChartRef.current.canvas.toDataURL());
  }
  if (yearlyChartRef.current) {
    setYearlyChartImg(yearlyChartRef.current.canvas.toDataURL());
  }
};

const handleRefresh = async () => {
  setIsRefreshing(true);
  try {
    // Force a page reload to refresh all data
    window.location.reload();
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
  } finally {
    setIsRefreshing(false);
  }
};



  const getSelectedContent = () => {
    const elements: HTMLElement[] = [];

    if (selectedDetails.includes("users") || selectedDetails.includes("documents") || selectedDetails.includes("departments")) {
      if (summaryRef.current) elements.push(summaryRef.current);
    }
    if (selectedDetails.includes("weekly") && weeklyRef.current) elements.push(weeklyRef.current);
    if (selectedDetails.includes("monthly") && monthlyRef.current) elements.push(monthlyRef.current);
    if (selectedDetails.includes("yearly") && yearlyRef.current) elements.push(yearlyRef.current);

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
    pdf.addImage(imgData, "PNG", marginLeft, position, usableWidth, imgHeight);
    heightLeft -= pageHeight - marginTop - marginBottom;
  }

  pdf.save("report.pdf");
};



 
    
  return (
    <div>
      <AdminHeader />

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
    <h3>Summary</h3>
    <div className={styles.summary}>
      {selectedDetails.includes("users") && (
        <div className={styles.summaryCard}>
          <Users />
          <div>
            <h4>Total Users</h4>
            <p>30</p>
          </div>
        </div>
      )}
      {selectedDetails.includes("documents") && (
        <div className={styles.summaryCard}>
          <FileText />
          <div>
            <h4>Total Documents</h4>
            <p>3</p>
          </div>
        </div>
      )}
      {selectedDetails.includes("departments") && (
        <div className={styles.summaryCard}>
          <School />
          <div>
            <h4>Total Departments</h4>
            <p>5</p>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Charts */}
{selectedDetails.includes("weekly") && (
  <div ref={weeklyRef} style={{ marginTop: "2rem" }}>
    <h3>Weekly Graph</h3>
    <Bar
      data={{
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "In Process",
            data: weeklyData.inProcess,
            backgroundColor: "#FFA500",
          },
          {
            label: "Completed",
            data: weeklyData.completed,
            backgroundColor: "#008000",
          },
          {
            label: "On Hold",
            data: weeklyData.onHold,
            backgroundColor: "#808080",
          },
          {
            label: "Approved",
            data: weeklyData.approved,
            backgroundColor: "#0000FF",
          },
          {
            label: "Awaiting Completion",
            data: weeklyData.awaitingCompletion,
            backgroundColor: "#800080",
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
)}

{selectedDetails.includes("monthly") && (
  <div ref={monthlyRef} style={{ marginTop: "2rem" }}>
    <h3>Monthly Graph</h3>
    <Bar
      data={{
        labels: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        datasets: [
          {
            label: "In Process",
            data: monthlyData.inProcess,
            backgroundColor: "#FFA500",
          },
          {
            label: "Completed",
            data: monthlyData.completed,
            backgroundColor: "#008000",
          },
          {
            label: "On Hold",
            data: monthlyData.onHold,
            backgroundColor: "#808080",
          },
          {
            label: "Approved",
            data: monthlyData.approved,
            backgroundColor: "#0000FF",
          },
          {
            label: "Awaiting Completion",
            data: monthlyData.awaitingCompletion,
            backgroundColor: "#800080",
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
)}

{selectedDetails.includes("yearly") && (
  <div ref={yearlyRef} style={{ marginTop: "2rem" }}>
    <h3>Yearly Graph</h3>
    <Bar
      data={{
        labels: ["2025"],
        datasets: [
          {
            label: "In Process",
            data: yearlyData.inProcess,
            backgroundColor: "#FFA500",
          },
          {
            label: "Completed",
            data: yearlyData.completed,
            backgroundColor: "#008000",
          },
          {
            label: "On Hold",
            data: yearlyData.onHold,
            backgroundColor: "#808080",
          },
          {
            label: "Approved",
            data: yearlyData.approved,
            backgroundColor: "#0000FF",
          },
          {
            label: "Awaiting Completion",
            data: yearlyData.awaitingCompletion,
            backgroundColor: "#800080",
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
)}
</div>

{showPrintModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h2>Select Data to Download</h2>

      <div className={styles.logoWrapper}>
        <img src="/logo.png" alt="Logo" className={styles.logoImage} />
      </div>

      <div className={styles.checkboxGroup}>
        <label>
          <input
            type="checkbox"
            checked={selectedDetails.includes("weekly")}
            onChange={(e) =>
              setSelectedDetails((prev) =>
                e.target.checked ? [...prev, "weekly"] : prev.filter((item) => item !== "weekly")
              )
            }
          />
          Weekly
        </label>

        <label>
          <input
            type="checkbox"
            checked={selectedDetails.includes("monthly")}
            onChange={(e) =>
              setSelectedDetails((prev) =>
                e.target.checked ? [...prev, "monthly"] : prev.filter((item) => item !== "monthly")
              )
            }
          />
          Monthly
        </label>

        <label>
          <input
            type="checkbox"
            checked={selectedDetails.includes("yearly")}
            onChange={(e) =>
              setSelectedDetails((prev) =>
                e.target.checked ? [...prev, "yearly"] : prev.filter((item) => item !== "yearly")
              )
            }
          />
          Yearly
        </label>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={handleDownload} className={styles.downloadButton}>
          Download PDF
        </button>
        <button onClick={() => setShowPrintModal(false)} className={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


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
                  <svg className={styles.spinner} width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6"/>
                    <path d="M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <hr className={styles.separator} />

          {/* Summary Cards */}
          <div className={styles.summary}>
            <Link href="./user-management" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.cyan}`}>
                <Users className={styles.icon} />
                <span className={styles.count}>30</span>
                <span>Total Users</span>
              </div>
            </Link>

            <Link href="./document-overview" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.green}`}>
                <FileText className={styles.icon} />
                <span className={styles.count}>3</span>
                <span>Total Documents</span>
              </div>
            </Link>

            <Link href="./user-management" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.orange}`}>
                <School className={styles.icon} />
                <span className={styles.count}>5</span>
                <span>Total Departments</span>
              </div>
            </Link>
          </div>

          <div className={styles.graphContainer}>
  {["weekly", "monthly", "yearly"].map((type) => {
    // Label sets
    const labels =
      type === "weekly"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : type === "monthly"
        ? [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ]
        : ["2025"];

    // Data sets
    const dataSet =
      type === "weekly"
        ? weeklyData
        : type === "monthly"
        ? monthlyData
        : yearlyData;

    // Build datasets array with new statuses
    const datasets = [
      {
        label: "In Process",
        data: dataSet.inProcess,
        backgroundColor: "#FFAC1C", // Orange
      },
      {
        label: "Completed",
        data: dataSet.completed,
        backgroundColor: "#50C878", // Green
      },
      {
        label: "On Hold",
        data: dataSet.onHold,
        backgroundColor: "#F08080", // Light red
      },
      {
        label: "Approved",
        data: dataSet.approved,
        backgroundColor: "#1E90FF", // Dodger blue
      },
      {
        label: "Awaiting Completion",
        data: dataSet.awaitingCompletion,
        backgroundColor: "#9370DB", // Purple
      },
    ];

    return (
      <div
        key={type}
        className={styles.chartCard}
        onClick={() => setActiveChart(type)}
      >
        <h3 className={styles.chartTitle}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </h3>
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
      </div>
    );
  })}
</div>


          <div className={styles.graphHeader}>
            <button className={styles.printButton} onClick={() => setShowPrintModal(true)}>
              Download
            </button>
          </div>
        </div>
      </div>

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
          {activeChart.charAt(0).toUpperCase() + activeChart.slice(1)} Documents
        </h3>
      </div>
      <div className={styles.modalChart}>
        <Bar
          data={{
            labels:
              activeChart === "weekly"
                ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                : activeChart === "monthly"
                ? [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                  ]
                : ["2025"],
            datasets: [
              {
                label: "In Process",
                data:
                  activeChart === "weekly"
                    ? weeklyData.inProcess
                    : activeChart === "monthly"
                    ? monthlyData.inProcess
                    : yearlyData.inProcess,
                backgroundColor: "#FFAC1C", // Orange
              },
              {
                label: "Completed",
                data:
                  activeChart === "weekly"
                    ? weeklyData.completed
                    : activeChart === "monthly"
                    ? monthlyData.completed
                    : yearlyData.completed,
                backgroundColor: "#50C878", // Green
              },
              {
                label: "On Hold",
                data:
                  activeChart === "weekly"
                    ? weeklyData.onHold
                    : activeChart === "monthly"
                    ? monthlyData.onHold
                    : yearlyData.onHold,
                backgroundColor: "#F08080", // Light red
              },
              {
                label: "Approved",
                data:
                  activeChart === "weekly"
                    ? weeklyData.approved
                    : activeChart === "monthly"
                    ? monthlyData.approved
                    : yearlyData.approved,
                backgroundColor: "#1E90FF", // Blue
              },
              {
                label: "Awaiting Completion",
                data:
                  activeChart === "weekly"
                    ? weeklyData.awaitingCompletion
                    : activeChart === "monthly"
                    ? monthlyData.awaitingCompletion
                    : yearlyData.awaitingCompletion,
                backgroundColor: "#9370DB", // Purple
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
<h3 className={styles.modalTitle}>Download</h3>
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
            prepareChartImages(); // if needed
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
