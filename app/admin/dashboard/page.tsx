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

  const summaryRef = useRef<HTMLDivElement>(null);
  const weeklyRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);
  const yearlyRef = useRef<HTMLDivElement>(null);

  const printRef = useRef<HTMLDivElement>(null);



  const weeklyData = [3, 2, 4, 1, 5, 0, 2];
  const monthlyData = [10, 12, 8, 14, 6, 11, 15, 9];
  const yearlyData = [100];

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
          datasets: [{
            label: "Weekly Documents",
            data: weeklyData,
            backgroundColor: "#800000"
          }],
        }}
        options={{
          responsive: false, // important for fixed size
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
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
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
          datasets: [{
            label: "Monthly Documents",
            data: monthlyData,
            backgroundColor: "#800000"
          }],
        }}
        options={{
          responsive: false,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
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
          datasets: [{
            label: "Yearly Documents",
            data: yearlyData,
            backgroundColor: "#800000"
          }],
        }}
        options={{
          responsive: false,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        }}
        width={600}
        height={300}
      />
    </div>
  )}
</div>

      {/* Main Content */}
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Admin Dashboard</h2>
          </div>
          <hr className={styles.separator} />

          {/* Summary Cards */}
          <div className={styles.summary}>
            <Link href="./user-management" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.orange}`}>
                <Users className={styles.icon} />
                <span className={styles.count}>30</span>
                <span>Total Users</span>
              </div>
            </Link>

            <Link href="./document-overview" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.cyan}`}>
                <FileText className={styles.icon} />
                <span className={styles.count}>3</span>
                <span>Total Documents</span>
              </div>
            </Link>

            <Link href="./user-management" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.green}`}>
                <School className={styles.icon} />
                <span className={styles.count}>5</span>
                <span>Total Departments</span>
              </div>
            </Link>
          </div>

          {/* Charts */}
          <div className={styles.graphContainer}>
            {["weekly", "monthly", "yearly"].map((type) => (
              <div key={type} className={styles.chartCard} onClick={() => setActiveChart(type as any)}>
                <h3 className={styles.chartTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                <Bar
                  data={{
                    labels:
                      type === "weekly"
                        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                        : type === "monthly"
                        ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
                        : ["2025"],
                    datasets: [
                      {
                        label: "Documents",
                        data: type === "weekly" ? weeklyData : type === "monthly" ? monthlyData : yearlyData,
                        backgroundColor: type === "weekly" ? "#FFA500" : type === "monthly" ? "#00BFFF" : "#32CD32",
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            ))}
          </div>

          <div className={styles.graphHeader}>
            <button className={styles.printButton} onClick={() => setShowPrintModal(true)}>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeChart && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <button className={styles.closeButton} onClick={() => setActiveChart(null)} aria-label="Close Modal">
              <X size={20} />
            </button>
            <div className={styles.modalTop}>
              <h3 className={styles.modalTitle}>{activeChart.charAt(0).toUpperCase() + activeChart.slice(1)} Documents</h3>
            </div>
            <div className={styles.modalChart}>
              <Bar
                data={{
                  labels:
                    activeChart === "weekly"
                      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                      : activeChart === "monthly"
                      ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
                      : ["2025"],
                  datasets: [
                    {
                      label: "Documents",
                      data:
                        activeChart === "weekly"
                          ? weeklyData
                          : activeChart === "monthly"
                          ? monthlyData
                          : yearlyData,
                      backgroundColor:
                        activeChart === "weekly"
                          ? "#FFA500"
                          : activeChart === "monthly"
                          ? "#00BFFF"
                          : "#32CD32",
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      )}

      {showPrintModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCardPrint}>
            <button className={styles.closeButton} onClick={() => setShowPrintModal(false)} aria-label="Close Modal">
              <X size={20} />
            </button>
            <div className={styles.modalTop}>
              <h3 className={styles.modalTitle}>Download Details</h3>
            </div>

            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedDetails.length === 6}
                  onChange={(e) =>
                    setSelectedDetails(
                      e.target.checked
                        ? ["users", "documents", "departments", "weekly", "monthly", "yearly"]
                        : []
                    )
                  }
                />
                Select All
              </label>
              {[
                { label: "Total Users", value: "users" },
                { label: "Total Documents", value: "documents" },
                { label: "Total Departments", value: "departments" },
                { label: "Weekly Graph", value: "weekly" },
                { label: "Monthly Graph", value: "monthly" },
                { label: "Yearly Graph", value: "yearly" },
              ].map((item) => (
                <label key={item.value}>
                  <input
                    type="checkbox"
                    value={item.value}
                    checked={selectedDetails.includes(item.value)}
                    onChange={(e) =>
                      setSelectedDetails((prev) =>
                        e.target.checked
                          ? [...prev, item.value]
                          : prev.filter((val) => val !== item.value)
                      )
                    }
                  />
                  {item.label}
                </label>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.actionButton} onClick={handleDownload}>Confirm</button>
            
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
