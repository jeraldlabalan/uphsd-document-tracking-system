"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./OnlineDocument.module.css";
const PDFViewer = dynamic(
  () => import("@/components/e-sign/pdfViewer/PDFViewer"),
  {
    ssr: false,
  }
);

export default function ESignTest() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const [role, setRole] = useState("sender");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const SIGNEES = [
    { id: "emp001", name: "Alice Mendoza" },
    { id: "emp002", name: "Bob Santos" },
    { id: "emp003", name: "Charlie Reyes" },
  ];

  return (
    <div className={styles.container}>
      {isSidebarOpen && (
        <div className={styles.sidebar}>
          <label>
            Choose Role:
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="sender">Sender</option>
              {SIGNEES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))} 
            </select>
          </label>

          <label>
            Upload PDF:
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      <div
        className={` ${styles.mainContent} ${isSidebarOpen ? styles.withSidebar : styles.fullWidth} `}
      >
        <header className={styles.header}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? "Hide" : "Show"} Sidebar
          </button>
        </header>
        <div className={styles.pdfViewer}>
          {pdfUrl && <PDFViewer role={role} pdfUrl={pdfUrl} />}
        </div>
      </div>
    </div>
  );
}
