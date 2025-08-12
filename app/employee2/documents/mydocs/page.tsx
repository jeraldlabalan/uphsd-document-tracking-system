"use client";
import { useEffect, useState } from "react";
import styles from "./mydocsStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon, X, FileText, Inbox, FileX } from "lucide-react";
import Link from "next/link";

type document = {
  id: number;
  name: string;
  file: string;
  status: string;
  date: string;
  type: string;
  creator: string;
  preview: string;
  recipient: string;
  remarks: string;
};

export default function MyDocuments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<document | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [documents, setDocuments] = useState<document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [showMarkCompletedSuccess, setShowMarkCompletedSuccess] =
    useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/employee/documents/mydocs");
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.docs || []);
        } else {
          console.error("Failed to load documents");
          setDocuments([]); // fallback to avoid undefined
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

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
    if (!selectedDoc?.type) return;
    const link = document.createElement("a");
    link.href = `/path/to/files/${selectedDoc.file}`;
    link.download = selectedDoc.file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsComplete = async () => {
    try {
      const res = await fetch("/api/employee/documents/mydocs/mark-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: selectedDoc?.id }), // Make sure id matches RequestID
      });

      const data = await res.json();
      if (res.ok) {
        setShowMarkCompletedSuccess(true);
      } else {
        console.error("Error completing document:", data.error);
        alert("Failed to complete document.");
      }
    } catch (err) {
      console.error("Request failed:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <EmpHeader />
      <div className={styles.container}>
        {/* Sidebar */}
        <div className={styles.sidebarContainer}>
          <div className={styles.sidebar}>
            <h2 className={styles.sidebarHeader}>Documents</h2>
            <ul className={styles.sidebarMenu}>
              <li>
                <Link href="" className={`${styles.menuItem} ${styles.active}`}>
                  <FileText size={20} />
                  <span>My Documents</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/employee2/documents/receivedocs"
                  className={styles.menuItem}
                >
                  <Inbox size={20} />
                  <span>Received</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.backLinkWrapper}>
            <Link href="/documents" className={styles.backLink}>
              Back to Document Page
            </Link>
          </div>
        </div>

        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <div className={styles.headerLeft}>
              <h2 className={styles.pageTitle}>My Documents</h2>
              <div className={styles.toggleButtons}>
                <button
                  className={`${styles.toggleButton} ${viewMode === "table" ? styles.activeToggle : ""}`}
                  onClick={() => setViewMode("table")}
                >
                  Table
                </button>
                <button
                  className={`${styles.toggleButton} ${viewMode === "card" ? styles.activeToggle : ""}`}
                  onClick={() => setViewMode("card")}
                >
                  Card
                </button>
              </div>
            </div>
            <hr className={styles.separator} />
          </div>

          {/* Filters */}
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
              <option>In-Process</option>
              <option>Approved</option>
              <option>Awaiting-Completion</option>
              <option>Completed</option>
              <option>On Hold</option>
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
                      setDateError(
                        '"From" date cannot be later than "To" date.'
                      );
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
                      setDateError(
                        '"To" date cannot be earlier than "From" date.'
                      );
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

          {/* Table or Card View */}
          {viewMode === "table" ? (
            <table className={styles.docTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Document</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Loading documents...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredDocs.length > 0 ? (
                  filteredDocs.map((doc, i) => (
                    <tr key={i}>
                      <td>{doc.id}</td>
                      <td>{doc.name}</td>
                      <td>
                        <span
                          className={`${styles.badge} 
                  ${
                    doc.status === "In-Process"
                      ? styles.inProcess
                      : doc.status === "Completed"
                        ? styles.completed
                        : doc.status === "On-Hold"
                          ? styles.onHold
                          : doc.status === "Approved"
                            ? styles.approved
                            : doc.status === "Awaiting-Completion"
                              ? styles.awaiting
                              : ""
                  }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td>{doc.date}</td>
                      <td className={styles.actions}>
                        <a href="#" onClick={() => setSelectedDoc(doc)}>
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className={styles.noDataRow}>
                    <td colSpan={6} className={styles.noDataCell}>
                      <div className={styles.noDataContent}>
                        <FileX className={styles.noDataIcon} />
                        <span className={styles.noDataText}>
                          No documents found.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className={styles.cardGrid}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Loading documents...</p>
                </div>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <div key={doc.id} className={styles.cardItem}>
                    <div className={styles.cardTop}>
                      <h3 className={styles.highlighted}>{doc.name}</h3>
                      <span
                        className={`${styles.badge} 
                ${
                  doc.status === "In-Process"
                    ? styles.inProcess
                    : doc.status === "Completed"
                      ? styles.completed
                      : doc.status === "On-Hold"
                        ? styles.onHold
                        : doc.status === "Approved"
                          ? styles.approved
                          : doc.status === "Awaiting-Completion"
                            ? styles.awaiting
                            : ""
                }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <p>
                      <strong className={styles.highlighted}>File:</strong>{" "}
                      {doc.file}
                    </p>
                    <p>
                      <strong className={styles.highlighted}>Type:</strong>{" "}
                      {doc.type}
                    </p>
                    <p>
                      <strong className={styles.highlighted}>Date:</strong>{" "}
                      {doc.date}
                    </p>
                    <p>
                      <strong className={styles.highlighted}>Creator:</strong>{" "}
                      {doc.creator}
                    </p>
                    <div className={styles.cardActions}>
                      <button onClick={() => setSelectedDoc(doc)}>View</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noDataContent}>
                  <FileX className={styles.noDataIcon} />
                  <span className={styles.noDataText}>No documents found.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedDoc && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedDoc(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className={styles.modalTop}>
                <h3 className={styles.modalTitle}>{selectedDoc.name}</h3>
                <span
                  className={`${styles.badge} 
                                ${
                                  selectedDoc.status === "In-Process"
                                    ? styles.inProcess
                                    : selectedDoc.status === "Completed"
                                      ? styles.completed
                                      : selectedDoc.status === "On-Hold"
                                        ? styles.onHold
                                        : selectedDoc.status === "Approved"
                                          ? styles.approved
                                          : selectedDoc.status ===
                                              "Awaiting-Completion"
                                            ? styles.awaiting
                                            : ""
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
                  />
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

              <div className={styles.modalFooter}>
                <div className={styles.leftButtons}>
                  <button className={styles.download} onClick={handleDownload}>
                    Download
                  </button>
                  <button className={styles.print} onClick={handlePrint}>
                    Print
                  </button>
                </div>
                <div className={styles.rightButton}>
                  <Link
                    href={`/employee2/edit-doc/${selectedDoc.id}`}
                  >
                    <button className={styles.edit}>Edit</button>
                  </Link>
                  {selectedDoc.status === "Awaiting-Completion" && (
                    <button
                      className={styles.markCompleteBtn}
                      onClick={handleMarkAsComplete}
                    >
                      Mark as Completed
                    </button>
                  )}

                  {selectedDoc.status === "On-Hold" && (
                    <button
                      className={styles.RemarksBtn}
                      onClick={() => setIsRemarksModalOpen(true)}
                    >
                      Remarks
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isRemarksModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCardRemarks}>
              <button
                className={styles.closeButton}
                onClick={() => setIsRemarksModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className={styles.modalTopRemarks}>
                <h3 className={styles.modalTitle}>
                  {selectedDoc?.name ?? ""} - Remarks
                </h3>
                <span className={`${styles.badge} ${styles.onHold}`}>
                  On-Hold
                </span>
              </div>

              <div className={styles.metaGrid}>
                <div className={styles.metaLabelRow}>
                  <span>Creator:</span>
                  <span>Type:</span>
                  <span>Date:</span>
                  <span>Recipient:</span>
                </div>
                <div className={styles.metaValueRow}>
                  <p>{selectedDoc?.creator ?? ""}</p>
                  <p>{selectedDoc?.type ?? ""}</p>
                  <p>{selectedDoc?.date ?? ""}</p>
                  <p>{selectedDoc?.recipient}</p>
                </div>
              </div>

              <p className={styles.remarksBox}>{selectedDoc?.remarks}</p>

              <div className={styles.modalFooterRemarks}>
                <button
                  className={styles.okButton}
                  onClick={() => setIsRemarksModalOpen(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* mark as complete modal */}
        {showMarkCompletedSuccess && (
          <div
            className={styles.modal}
            onClick={() => setShowMarkCompletedSuccess(false)}
          >
            <div className={styles.modalContent}>
              <div className={styles.confirmSuccessContainer}>
                <h1>success!</h1>
                <p>Document successfully completed.</p>

                <button
                  onClick={() => {
                    setShowMarkCompletedSuccess(false);
                    window.location.reload();
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
