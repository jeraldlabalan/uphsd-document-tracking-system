"use client";
import { useState } from "react";
import styles from "./receivedocsStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon, X, FileText, Inbox } from "lucide-react";
import Link from "next/link";

export default function receiveDocuments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const documents = [
    {
      id: 1,
      name: "Budget Report",
      file: "budget2025.pdf",
      status: "Completed",
      date: "2025-07-26",
      type: "Budget",
      creator: "John Doe",
      preview: "/1-Student-Internship-MOA-CvSU-Bacoor-CS-Group (1).pdf",
    },
    {
      id: 2,
      name: "IT Evaluation",
      file: "eval-it.docx",
      status: "Pending",
      date: "2025-07-20",
      type: "Evaluation",
      creator: "John HAHA",
      preview: "/1-Student-Internship-MOA-CvSU-Bacoor-CS-Group (1).pdf",
    },
  ];

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
      (!fromDate || docDate >= fromDate) &&
      (!toDate || docDate <= toDate);
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const handleDownload = () => {
    if (!selectedDoc?.file) return;
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
                <Link href="/employee2/documents/mydocs" className={styles.menuItem}>
                  <FileText size={20} />
                  <span>My Documents</span>
                </Link>
              </li>
              <li>
                <Link href="" className={`${styles.menuItem} ${styles.active}`}>
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
              <h2 className={styles.pageTitle}>Received Documents</h2>
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

          {/* Table or Card View */}
          {viewMode === "table" ? (
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
                {filteredDocs.map((doc, i) => (
                  <tr key={i}>
                    <td>{doc.id}</td>
                    <td>{doc.name}</td>
                    <td>{doc.file}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          doc.status === "Completed" ? styles.completed : styles.pending
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td>{doc.date}</td>
                    <td className={styles.actions}>
                      <a href="#" onClick={() => setSelectedDoc(doc)}>View</a> |{" "}
                      <Link href="./edit-doc">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.cardGrid}>
              {filteredDocs.map((doc) => (
                <div key={doc.id} className={styles.cardItem}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.highlighted}>{doc.name}</h3>
                    <span
                      className={`${styles.badge} ${
                        doc.status === "Completed" ? styles.completed : styles.pending
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <p><strong className={styles.highlighted}>File:</strong> {doc.file}</p>
                  <p><strong className={styles.highlighted}>Type:</strong> {doc.type}</p>
                  <p><strong className={styles.highlighted}>Date:</strong> {doc.date}</p>
                  <p><strong className={styles.highlighted}>Creator:</strong> {doc.creator}</p>
                  <div className={styles.cardActions}>
                    <button onClick={() => setSelectedDoc(doc)}>View</button>
                    <Link href="./edit-doc">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedDoc && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <button className={styles.closeButton} onClick={() => setSelectedDoc(null)} aria-label="Close">
                <X size={20} />
              </button>

              <div className={styles.modalTop}>
                <h3 className={styles.modalTitle}>{selectedDoc.name}</h3>
                <span
                  className={`${styles.badge} ${
                    selectedDoc.status === "Completed" ? styles.completed : styles.pending
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
                    <a href={selectedDoc.preview} target="_blank" rel="noopener noreferrer">
                      Download File
                    </a>
                  </p>
                ) : (
                  <p>No file selected.</p>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.download} onClick={handleDownload}>Download</button>
                <button className={styles.print} onClick={handlePrint}>Print</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
