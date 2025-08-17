"use client";
import { useEffect, useState } from "react";
import styles from "./mydocsStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon, X, FileText, Inbox, FileX } from "lucide-react";
import Link from "next/link";
import { fetchFilterData, FilterData } from "@/lib/filterData";

import AOS from "aos";
import "aos/dist/aos.css";

type document = {
  id: number;
  requestId: number | null;
  name: string;
  file: string;
  status: string;
  date: string;
  type: string;
  creator: string;
  preview: string;
  latestVersion: {
    filePath: string;
  };
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
  const [departmentFilter, setDepartmentFilter] = useState("");

  
  const [filterData, setFilterData] = useState<FilterData>({
    documentTypes: [],
    departments: [],
    statuses: []
  });
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [showMarkCompletedSuccess, setShowMarkCompletedSuccess] =
    useState(false);

    useEffect(() => {
          AOS.init({
            duration: 1000,
            once: true,
          });
        }, []);

  useEffect(() => {
  const fetchAllData = async () => {
    try {
      setLoading(true); // ✅ start loader

      // Fetch documents
      const resDocs = await fetch("/api/employee/documents/mydocs");
      let docs: any[] = [];
      if (resDocs.ok) {
        const dataDocs = await resDocs.json();
        docs = dataDocs.docs || [];
      } else {
        console.error("Failed to load documents");
      }
      setDocuments(docs);

      // Fetch filter data
      const filterData = await fetchFilterData();
      setFilterData(filterData);

    } catch (error) {
      console.error("Error fetching data:", error);
      setDocuments([]);
      setFilterData([]);
    } finally {
      setLoading(false); // ✅ stop loader after both fetches
    }
  };

  fetchAllData();
}, []);


  const filteredDocs = documents.filter((doc) => {
  const matchesSearch =
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.id.toString().includes(search);

  const matchesStatus = !statusFilter || doc.status === statusFilter;
  const matchesType = !typeFilter || doc.type === typeFilter;
  const matchesDepartment = !departmentFilter || doc.department === departmentFilter;

  const docDate = new Date(doc.date);
  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(dateTo) : null;
  const matchesDate =
    (!fromDate || docDate >= fromDate) && (!toDate || docDate <= toDate);

  return (
    matchesSearch &&
    matchesStatus &&
    matchesType &&
    matchesDepartment &&
    matchesDate
  );
});


  const handleDownload = () => {
    if (!selectedDoc?.latestVersion?.filePath) return;
    const link = document.createElement("a");
    link.href = selectedDoc.latestVersion.filePath;
    link.download = `document-${selectedDoc.id}.pdf`;
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
        body: JSON.stringify({ requestId: selectedDoc?.requestId }), // Use requestId instead of id
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
        {/* Sidebar */}
        <div className={styles.sidebarContainer} data-aos="fade-up">
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
            <Link href="/employee2/documents" className={styles.backLink}>
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
              {filterData.statuses.map((status) => (
                <option key={status.StatusID} value={status.StatusName}>
                  {status.StatusName}
                </option>
              ))}
            </select>

            <select
                className={styles.dropdown}
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {filterData.departments.map((dept) => (
                  <option key={dept.DepartmentID} value={dept.Name}>
                    {dept.Name}
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
            <table data-aos="fade-up" className={styles.docTable}>
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
  paginatedDocs.map((doc, i) => (
    <tr key={i}>
                      <td>{doc.id}</td>
                      <td>{doc.name}</td>
                      <td>{doc.type}</td>
                      <td>
                        <span className={`${styles.badge} ${
                  doc.status === "Completed" ? styles.completed : 
                  doc.status === "In-Process" ? styles.inProcess : 

                  doc.status === "Approved" ? styles.approved : 
                  doc.status === "Awaiting Signatures" ? styles.pending :
                  doc.status === "Awaiting-Completion" ? styles.awaiting :
                  doc.status === "On Hold" || doc.status === "On-Hold"

                                                      ? styles.onHold :

                  styles.pending
                }`}>
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
            <div data-aos="fade-up" className={styles.cardGrid}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Loading documents...</p>
                </div>
              ) : filteredDocs.length > 0 ? (
              paginatedDocs.map((doc) => (
                  <div key={doc.id} className={styles.cardItem}>
                    <div className={styles.cardTop}>
                      <h3 className={styles.highlighted}>{doc.name}</h3>
                      <span className={`${styles.badge} ${
                  doc.status === "Completed" ? styles.completed : 
                  doc.status === "In-Process" ? styles.inProcess : 

                  doc.status === "Approved" ? styles.approved : 
                  doc.status === "Awaiting Signatures" ? styles.pending :
                  doc.status === "Awaiting-Completion" ? styles.awaiting :
                  doc.status === "On Hold" || doc.status === "On-Hold"

                                                      ? styles.onHold :

                  styles.pending
                }`}>
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

     {/* Modal for Documents WITH Files */}
{selectedDoc && selectedDoc.latestVersion?.filePath && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalCard} data-aos="zoom-in">
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
          className={`${styles.badge} ${
            selectedDoc.status === "Completed"
              ? styles.completed
              : selectedDoc.status === "In-Process"
              ? styles.inProcess
              : selectedDoc.status === "Approved"
              ? styles.approved
              : selectedDoc.status === "Awaiting Signatures"
              ? styles.pending
              : selectedDoc.status === "Awaiting-Completion"
              ? styles.awaiting
              : selectedDoc.status === "On Hold" || selectedDoc.status === "On-Hold"
              ? styles.onHold
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

      {/* File Preview */}
      <div className={styles.previewContainer}>
        {selectedDoc.latestVersion.filePath.match(/\.pdf$/i) ? (
          <iframe
             src={`${selectedDoc.latestVersion.filePath}#toolbar=0&navpanes=0`}
            title="PDF Preview"
            width="100%"
            height="600px"
            style={{ border: "none" }}
          />
        ) : (
          <p>
            <a
              href={selectedDoc.latestVersion.filePath}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download File
            </a>
          </p>
        )}
      </div>

      {/* Footer */}
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
          {!["Completed", "Awaiting-Completion"].includes(selectedDoc.status) && (
            <Link href={`/employee2/edit-doc/${selectedDoc.id}`}>
              <button className={styles.edit}>Edit</button>
            </Link>
          )}

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

{/* Modal for Documents WITHOUT Files */}
{selectedDoc && !selectedDoc.latestVersion?.filePath && (
  <div className={styles.modalOverlay}>
   <div className={styles.modalCardNoFile} data-aos="zoom-in">
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
          className={`${styles.badge} ${
            selectedDoc.status === "Completed"
              ? styles.completed
              : selectedDoc.status === "In-Process"
              ? styles.inProcess
              : selectedDoc.status === "Approved"
              ? styles.approved
              : selectedDoc.status === "Awaiting Signatures"
              ? styles.pending
              : selectedDoc.status === "Awaiting-Completion"
              ? styles.awaiting
              : selectedDoc.status === "On Hold" || selectedDoc.status === "On-Hold"
              ? styles.onHold
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

      {/* Instead of preview */}
      <div className={styles.noFileMessage}>
        <p>This document has no attached files.</p>
      </div>

      {/* Footer */}
      <div className={styles.modalFooter}>
        <div className={styles.rightButton}>
          {!["Completed", "Awaiting-Completion"].includes(selectedDoc.status) && (
            <Link href={`/employee2/edit-doc/${selectedDoc.id}`}>
              <button className={styles.edit}>Edit</button>
            </Link>
          )}

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
            <div className={styles.modalCardRemarks} data-aos="zoom-in">
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
            <div className={styles.modalContent} data-aos="zoom-in">
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
