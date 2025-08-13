"use client";

import { useState, useEffect } from "react";
import styles from "./empDashboardStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon } from "lucide-react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import PendingSignatures from "./pending-signatures";

export default function employeeDashboard() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null); // modal state
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [summary, setSummary] = useState({
    total: 0,
    inProcess: 0,
    completed: 0,
    pending: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  type Document = {
    id: number;
    name: string;
    type: string;
    file: string;
    status: string;
    date: string;
    creator: string;
    preview?: string;
  };

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/employee/dashboard");
      const data = await res.json();

      const formattedDocs: Document[] = (data.recentDocuments || []).map(
        (req: any) => ({
          id: req.Document?.DocumentID,
          name: req.Document?.Title || "Untitled",
          type: req.Document?.DocumentType?.TypeName || "Unknown",
          file: "PDF File",
          status: req.Status?.StatusName || "Pending",
          date: new Date(req.RequestedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          creator: `${req.RequestedBy?.FirstName || "Unknown"} ${req.RequestedBy?.LastName || ""}`,
          preview: req.Document?.FilePath || "",
        })
      );

      setDocuments(formattedDocs);
      setSummary({
        total: formattedDocs.length,
        inProcess: data.inProcess,
        completed: data.completed,
        pending: data.pendingSignatures,
      });
    } catch (err) {
      console.error("Failed to fetch document data", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchData();
  }, []);

  

  // const documents: Document[] = [
  //   {
  //     name: "IT Equipment Purchase Request",
  //     type: "Request",
  //     file: "PDF File",
  //     status: "Pending",
  //     date: "July 5, 2025",
  //     creator: "Kai Sotto",
  //     preview: "/1-Student-Internship-MOA-CvSU-Bacoor-CS-Group (1).pdf",
  //   },
  //   {
  //     name: "Student Grades",
  //     type: "Evaluation",
  //     file: "PDF File",
  //     status: "Completed",
  //     date: "July 5, 2025",
  //     creator: "Kobe Bryant",
  //     preview: "/example-doc.png",
  //   },
  //   {
  //     name: "Student Good Moral Request",
  //     type: "Request",
  //     file: "PDF File",
  //     status: "Pending",
  //     date: "July 5, 2025",
  //     creator: "Kyrie Irving",
  //     preview: "/example-doc.png",
  //   },
  // ];

  const handleDownload = () => {
    if (selectedDoc?.preview) {
      const link = document.createElement("a");
      link.href = selectedDoc.preview;
      link.download = selectedDoc.name || "document";
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleView = async (id: number) => {
    const res = await fetch(`/api/documents/${id}`);
    const data = await res.json();
    setSelectedDoc(data); // assuming it returns full doc details
  };

  const handlePrint = () => {
    if (selectedDoc?.preview) {
      const printWindow = window.open(selectedDoc.preview, "_blank");
      if (printWindow) {
        printWindow.focus();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const statusMatch = !statusFilter || doc.status === statusFilter;
    const typeMatch = !typeFilter || doc.type === typeFilter;
    const searchMatch = doc.name.toLowerCase().includes(search.toLowerCase());
    return statusMatch && typeMatch && searchMatch;
  });

  return (
    <div>
      <EmpHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Dashboard</h2>
            <div className={styles.headerButtons}>
              <button 
                onClick={fetchData}
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
              <Link href="./create-new-doc">
                <button className={styles.createButton}>
                  + Create New Document
                </button>
              </Link>
            </div>
          </div>
          <hr className={styles.separator} />

          <div className={styles.summary}>
            <div className={`${styles.card} ${styles.orange}`}>
              <span className={styles.count}>{summary.total}</span>
              <span>Total Documents</span>
            </div>
            <div className={`${styles.card} ${styles.cyan}`}>
              <span className={styles.count}>{summary.inProcess}</span>
              <span>In Process</span>
            </div>
            <div className={`${styles.card} ${styles.green}`}>
              <span className={styles.count}>{summary.completed}</span>
              <span>Completed</span>
            </div>
            <div className={`${styles.card} ${styles.red}`}>
              <span className={styles.count}>{summary.pending}</span>
              <span>On Hold</span>
            </div>
          </div>

          {/* Pending Signatures Section */}
          <div className={styles.pendingSignaturesSection}>
            <PendingSignatures />
          </div>
        </div>
        </div>
        </div>
    
  );
}
