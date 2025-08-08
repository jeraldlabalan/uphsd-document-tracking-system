"use client";
import { useState, useEffect } from "react";
import styles from "./documentsStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, User } from "lucide-react";

import Link from "next/link";
import { X } from "lucide-react";

type Document = {
  id: number;
  name: string;
  file: string;
  status: string;
  date: string;
  type: string;
  creator: string;
  preview: string;
};

export default function Documents() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");

  // const documents = [
  //   {
  //     id: 1,
  //     name: "Budget Report",
  //     file: "budget2025.pdf",
  //     status: "Completed",
  //     date: "2025-07-26",
  //     type: "Budget",
  //     creator: "John Doe",
  //     preview: "/1-Student-Internship-MOA-CvSU-Bacoor-CS-Group (1).pdf",
  //   },


  //   {
  //     id: 2,
  //     name: "IT Evaluation",
  //     file: "eval-it.docx",
  //     status: "Pending",
  //     date: "2025-07-20",
  //     type: "Evaluation",
  //     creator: "John HAHA",
  //     preview: "/1-Student-Internship-MOA-CvSU-Bacoor-CS-Group (1).pdf",
  //   },
  // ];


useEffect(() => {
  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/employee/documents");
      const data = await res.json();

      // Log to verify shape
      console.log("API response:", data);

      // Make sure to access the array correctly
      if (Array.isArray(data)) {
        setDocuments(data);
      } else if (Array.isArray(data.docs)) {
        setDocuments(data.docs); // ✅ most likely this
      } else {
        console.error("❌ Invalid documents data:", data);
        setDocuments([]); // fallback to prevent crashes
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  fetchDocuments();
}, []);
  // const documents = [
  //   {
  //     id: 1,
  //     name: "Budget Report",
  //     file: "budget2025.pdf",
  //     status: "Completed",
  //     date: "2025-07-26",
  //     type: "Budget",
  //     creator: "John Doe",
  //     preview: "/1-Student-Internship-MOA-CvSU-Bacoor-CS-Group (1).pdf",
  //   },

  //   {
  //     id: 2,
  //     name: "IT Evaluation",
  //     file: "eval-it.docx",
  //     status: "Pending",
  //     date: "2025-07-20",
  //     type: "Evaluation",
  //     creator: "John HAHA",
  //     preview: "/1-Student-Internship-MOA-CvSU-Bacoor-CS-Group (1).pdf",
  //   },
  // ];


  // const formattedDocs: Document[] = documents.map((doc) => ({
  //   id: doc.DocumentID,
  //   name: doc.Title,
  //   file: doc.FilePath,
  //   status: doc.Status,
  //   date: doc.CreatedAt.toISOString().split("T")[0],
  //   type: doc.Type?.TypeName ?? "N/A",
  //   creator: `${user.FirstName} ${user.LastName}`,
  //   preview: `/uploads/${doc.FilePath}`,
  // }));



  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.id.toString().includes(search);

    const matchesStatus = !statusFilter || doc.status === statusFilter;
    const matchesType = !typeFilter || doc.type === typeFilter;

    const docDate = new Date(doc.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const matchesDate =
      (!fromDate || docDate >= fromDate) && (!toDate || docDate <= toDate);

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const handleDownload = () => {
    if (!selectedDoc?.file) return;
    const link = document.createElement("a");
    link.href = `/path/to/files/${selectedDoc.file}`; // Adjust file path accordingly
    link.download = selectedDoc.file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <EmpHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Documents</h2>
            <hr className={styles.separator} />
          </div>

          <div className={styles.foldersWrapper}>
            <Link
              href="/employee2/documents/mydocs"
              className={styles.folderShape}
            >
              <span className={styles.folderText}>MY DOCUMENTS</span>
            </Link>

            <Link
              href="/employee2/documents/receivedocs"
              className={styles.folderShape}
            >
              <span className={styles.folderText}>RECEIVED DOCUMENTS</span>
            </Link>
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
            <div className={styles.dateFilterWrapper}>
              <div className={styles.dateGroup}>
                <span className={styles.dateLabel}>From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    const newFrom = e.target.value;
                    setDateFrom(newFrom);

                    if (dateTo && newFrom > dateTo) {
                      setDateError('"From" date cannot be later than "To" date.');
                    } else {
                      setDateError("");
                    }
                  }}
                  className={styles.dateInput}
                />
                <span className={styles.dateLabel}>To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    const newTo = e.target.value;
                    setDateTo(newTo);

                    if (dateFrom && newTo < dateFrom) {
                      setDateError('"To" date cannot be earlier than "From" date.');
                    } else {
                      setDateError("");
                    }
                  }}
                  className={styles.dateInput}
                  min={dateFrom}
                />

              </div>
            </div>
          </div>

          <table className={styles.docTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Document</th>
                <th>File</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
  {filteredDocs.length > 0 ? (
    filteredDocs.map((doc, i) => (
      <tr key={i}>
        <td>{doc.id}</td>
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
          | <Link href={`./edit-doc/${doc.id}`}>Edit</Link>
        </td>
      </tr>
    ))
  ) : (
    <tr className={styles.noDataRow}>
      <td colSpan={6} style={{ textAlign: "center" }}>
        No documents found.
      </td>
    </tr>
  )}
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

              <div className={styles.previewContainer}>
                {selectedDoc.preview?.match(/\.pdf$/i) ? (
                  <iframe
                    src={`${selectedDoc.preview}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="PDF Preview"
                    width="100%"
                    height="600px"
                    style={{ border: "none" }}
                  ></iframe>
                ) : selectedDoc.preview ? (
                  <p>
                    <a
                      href={selectedDoc.preview}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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

        {dateError && (
  <div className={styles.errorBox}>
    <p className={styles.errorText}>{dateError}</p>
  </div>
)}

      </div>
    </div>
  );
}
