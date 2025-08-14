"use client";
import { useState, useEffect } from "react";
import styles from "./documentsStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, User } from "lucide-react";
import { fetchFilterData, FilterData } from "@/lib/filterData";

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
  const [filterData, setFilterData] = useState<FilterData>({
    documentTypes: [],
    departments: [],
    statuses: []
  });
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

  const loadFilterData = async () => {
    const data = await fetchFilterData();
    setFilterData(data);
  };

  fetchDocuments();
  loadFilterData();
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
    if (!selectedDoc?.preview) return;
    const link = document.createElement("a");
    link.href = selectedDoc.preview;
    link.download = selectedDoc.name || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (selectedDoc?.preview) {
      // Open the file in a new tab for printing
      window.open(selectedDoc.preview, "_blank", "noopener,noreferrer");
    } else {
      alert("No file available to print.");
    }
  };

    // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const docsPerPage = 6;
  
  const totalPages = Math.ceil(filteredDocs.length / docsPerPage);
  
  const startIndex = (currentPage - 1) * docsPerPage;
  const endIndex = startIndex + docsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, endIndex);
  
  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  
  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
              {filterData.statuses.map((status) => (
                <option key={status.StatusID} value={status.StatusName}>
                  {status.StatusName}
                </option>
              ))}
            </select>

            <select
              className={styles.dropdown}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {filterData.documentTypes.map((type) => (
                <option key={type.TypeID} value={type.TypeName}>
                  {type.TypeName}
                </option>
              ))}
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
  paginatedDocs.map((doc, i) => (
    <tr key={i}>
        <td>{doc.id}</td>
        <td>{doc.name}</td>
        <td>{doc.preview ? doc.preview.split('.').pop()?.toUpperCase() || 'File' : 'No file'}</td>
        <td>
          <span className={`${styles.badge} ${
                  doc.status === "Completed" ? styles.completed : 
                  doc.status === "In-Process" ? styles.inProcess : 
                  doc.status === "Awaiting Signatures" ? styles.pending :
                  doc.status === "Awaiting-Completion" ? styles.awaiting :
                  doc.status === "On Hold" || selectedDoc.status === "On-Hold"
                                                      ? styles.onHold :

                  styles.pending
                }`}>
                  {doc.status}
                </span>
        </td>
        <td>{doc.date}</td>
        <td className={styles.actions}>
          <a href="#" onClick={() => {
            console.log("Selected document:", doc);
            console.log("Document preview:", doc.preview);
            setSelectedDoc(doc);
          }}>
            View
          </a>{" "}
          | <Link href={`/employee2/edit-doc/${doc.id}`}>Edit</Link>
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
                    {/* Pagination controls */}
<div className={styles.pagination}>
  <button onClick={handlePrev} disabled={currentPage === 1}>
    Previous
  </button>
  
  <span>
    Page {currentPage} of {totalPages}
  </span>
  
  <button onClick={handleNext} disabled={currentPage === totalPages}>
    Next
  </button>
</div>
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
                <span className={`${styles.badge} ${
                  selectedDoc.status === "Completed" ? styles.completed : 
                  selectedDoc.status === "In-Process" ? styles.inProcess : 
                  selectedDoc.status === "Awaiting Signatures" ? styles.pending :
                  selectedDoc.status === "Awaiting-Completion" ? styles.awaiting :
                  selectedDoc.status === "On Hold" || selectedDoc.status === "On-Hold"
                                                      ? styles.onHold :

                  styles.pending
                }`}>
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
                {selectedDoc.preview ? (
                  (() => {
                    const isPDF = selectedDoc.preview.match(/\.pdf$/i);
                    
                    if (isPDF) {
                      return (
                        <div>
                          <iframe
                            src={`${selectedDoc.preview}#toolbar=0&navpanes=0&scrollbar=0`}
                            title="PDF Preview"
                            width="100%"
                            height="600px"
                            style={{ border: "none" }}
                            onError={(e) => {
                              console.error("Iframe error:", e);
                            }}
                            onLoad={() => {
                              console.log("PDF loaded successfully");
                            }}
                          />
                          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                            <p>If the preview doesn't load, you can:</p>
                            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                              <li><a href={selectedDoc.preview} target="_blank" rel="noopener noreferrer">Open the file in a new tab</a></li>
                              <li><a href={selectedDoc.preview} download>Download the file directly</a></li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div>
                          <p>File type: {selectedDoc.preview.split('.').pop()?.toUpperCase()}</p>
                          <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                            This file type cannot be previewed in the browser.
                          </p>
                          <a
                            href={selectedDoc.preview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.downloadLink}
                          >
                            Download File
                          </a>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div>
                    <p>No file available.</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      This document may not have an attached file or the file path is missing.
                    </p>
                  </div>
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
