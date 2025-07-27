"use client";

import { useState, useEffect } from "react";
import styles from "./empDashboardStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import { X } from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";

export default function employeeDashboard() {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null); // modal state

  const documents = [
    {
      name: "IT Equipment Purchase Request",
      type: "Request",
      file: "PDF File",
      status: "Pending",
      date: "July 5, 2025",
      creator: "Kai Sotto",
      preview: "/1-Student-Internship-MOA-CvSU-Bacoor-CS-Group (1).pdf",
    },
    {
      name: "Student Grades",
      type: "Evaluation",
      file: "PDF File",
      status: "Completed",
      date: "July 5, 2025",
      creator: "Kobe Bryant",
      preview: "/example-doc.png",
    },
    {
      name: "Student Good Moral Request",
      type: "Request",
      file: "PDF File",
      status: "Pending",
      date: "July 5, 2025",
      creator: "Kyrie Irving",
      preview: "/example-doc.png",
    },
  ];

  const handleDownload = () => {
    if (selectedDoc?.preview) {
      const link = document.createElement('a');
      link.href = selectedDoc.preview;
      link.download = selectedDoc.name || 'document'; 
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (selectedDoc?.preview) {
      const printWindow = window.open(selectedDoc.preview, '_blank');
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
            <Link href="./create-new-doc">
              <button className={styles.createButton}>
                + Create New Document
              </button>
            </Link>
          </div>
          <hr className={styles.separator} />

          <div className={styles.summary}>
            <div className={`${styles.card} ${styles.orange}`}>
              <span className={styles.count}>30</span>
              <span>Total Documents</span>
            </div>
            <div className={`${styles.card} ${styles.cyan}`}>
              <span className={styles.count}>3</span>
              <span>In Process</span>
            </div>
            <div className={`${styles.card} ${styles.green}`}>
              <span className={styles.count}>5</span>
              <span>Completed</span>
            </div>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search documents..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className={styles.dropdown}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option>Pending</option>
              <option>In Process</option>
              <option>Completed</option>
              <option>Rejected</option>
            </select>

            <select
              className={styles.dropdown}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option>Report</option>
              <option>Request</option>
              <option>Evaluation</option>
              <option>Budget</option>
            </select>
          </div>

          <table className={styles.docTable}>
            <thead>
              <tr>
                <th>Document</th>
                <th>File</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc, i) => (
                <tr key={i}>
                  <td>{doc.name}</td>
                  <td>{doc.file}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        doc.status === "Completed"
                          ? styles.completed
                          : styles.pending
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td>{doc.date}</td>
                  <td className={styles.actions}>
                    <a href="#" onClick={() => setSelectedDoc(doc)}>
                      View
                    </a>{" "}
                    | <Link href="./edit-doc">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedDoc && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedDoc(null)}
                aria-label="Close Modal"
              >
                <X size={20} />
              </button>

              {/* Header Row */}
              <div className={styles.modalTop}>
                <h3 className={styles.modalTitle}>{selectedDoc.name}</h3>
                <span
                  className={`${styles.badge} ${
                    selectedDoc.status === "Completed"
                      ? styles.completed
                      : styles.pending
                  }`}
                >
                  {selectedDoc.status}
                </span>
              </div>

              {/* Metadata Row */}
              <div className={styles.metaGrid}>
                <div className={styles.metaLabelRow}>
                  <span>Creator:</span>
                  <span>Type:</span>
                  <span>Date:</span>
                </div>
                <div className={styles.metaValueRow}>
                  <p>{selectedDoc.creator}</p>
                  <p>{selectedDoc.type}</p>
                  <p>{selectedDoc.date}</p>
                </div>
              </div>

              {/* Document Preview */}
              <div className={styles.previewContainer}>
  {selectedDoc.preview?.match(/\.pdf$/i) ? (
    <iframe
      src={`${selectedDoc.preview}#toolbar=0&navpanes=0&scrollbar=0`}
      title="PDF Preview"
      width="100%"
      height="600px"
      style={{ border: 'none' }}
    ></iframe>
  ) : selectedDoc.preview ? (
    <p>
      <a href={selectedDoc.preview} target="_blank" rel="noopener noreferrer">
        Download File
      </a>
    </p>
  ) : (
    <p>No file selected.</p>
  )}
</div>


              {/* Footer Buttons */}
               <div className={styles.modalFooter}>
        <button className={styles.download} onClick={handleDownload}>
          Download
        </button>
        <button className={styles.print} onClick={handlePrint}>
          Print
        </button>
      </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
