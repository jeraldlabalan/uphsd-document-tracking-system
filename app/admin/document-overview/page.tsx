"use client";

import { useState, useEffect } from "react";
import styles from "./documentOverview.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import { Search as SearchIcon } from "lucide-react";
import { X, FileCheck, FileText, Trash2, CheckCircle } from "lucide-react";
import { fetchFilterData, FilterData } from "@/lib/filterData";

export default function DocumentOverview() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState("");

  const [documents, setDocuments] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ totalDocuments: number; inProcessDocuments: number; deletedDocuments: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterData, setFilterData] = useState<FilterData>({
    documentTypes: [],
    departments: [],
    statuses: []
  });

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/document-overview", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
      setSummary(data.summary || null);
    } catch (e) {
      console.error(e);
      setDocuments([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // Load filter data
    const loadFilterData = async () => {
      const data = await fetchFilterData();
      setFilterData(data);
    };
    loadFilterData();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const statusMatch = !statusFilter || (doc.status || "").toLowerCase() === statusFilter.toLowerCase();
    const typeMatch = !typeFilter || (doc.type || "").toLowerCase() === typeFilter.toLowerCase();
    const searchMatch = !search || (doc.title || "").toLowerCase().includes(search.toLowerCase());

    const docDate = new Date(doc.dateCreated);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const dateMatch = (!fromDate || docDate >= fromDate) && (!toDate || docDate <= toDate);

    return statusMatch && typeMatch && searchMatch && dateMatch;
  });

  

  const handleCloseModal = () => setIsModalOpen(false); 
  const handleCloseSuccess = () => setShowSuccessModal(false);
  

  
  async function handleConfirmDelete() {
    try {
      if (!selectedDoc?.id) return;
      const res = await fetch("/api/admin/document-overview", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc.id }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setIsModalOpen(false);
      setSelectedDoc(false);
      setShowSuccessModal(true);
      await loadData();
    } catch (e) {
      console.error(e);
      setIsModalOpen(false);

    }
  }

  // for pagination
  const [currentPage, setCurrentPage] = useState(1);
const docsPerPage = 5; // number of docs per page

// Calculate total pages
const totalPages = Math.ceil(filteredDocs.length / docsPerPage);

// Calculate slicing indexes
const startIndex = (currentPage - 1) * docsPerPage;
const endIndex = startIndex + docsPerPage;

// Slice the docs for the current page
const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

// Pagination handlers
const handlePrev = () => {
  setCurrentPage((prev) => Math.max(prev - 1, 1));
};

const handleNext = () => {
  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
};





  return (
    <div>
      <AdminHeader />
      <div className={styles.container}>
        <div className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Document Overview</h2>
            
            
          </div>
          <hr className={styles.separator} />

          <div className={styles.summary}>
            <div className={`${styles.card} ${styles.green}`}>

              <FileCheck className={styles.icon} />
              <span className={styles.count}>{summary?.inProcessDocuments ?? 0}</span>
              <span>In-Process</span>

            </div>

            <div className={`${styles.card} ${styles.red}`}>
              <Trash2 className={styles.icon} />
              <span className={styles.count}>{summary?.deletedDocuments ?? 0}</span>
              <span>Deleted</span>
            </div>

            <div className={`${styles.card} ${styles.cyan}`}>
              <FileText className={styles.icon} />
              <span className={styles.count}>{summary?.totalDocuments ?? 0}</span>
              <span>Total</span>
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

            <select className={styles.dropdown} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {filterData.statuses.map((status) => (
                <option key={status.StatusID} value={status.StatusName}>
                  {status.StatusName}
                </option>
              ))}
            </select>

            <select className={styles.dropdown} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
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
                    if (dateTo && newFrom > dateTo) setDateError('"From" date cannot be later than "To" date.');
                    else setDateError("");
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
                    if (dateFrom && newTo < dateFrom) setDateError('"To" date cannot be earlier than "From" date.');
                    else setDateError("");
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
                <th>Title</th>
                <th>Department</th>
                <th>Status</th>
                <th>Date Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
  {paginatedDocs.length > 0 ? (
    paginatedDocs.map((doc, i) => (
      <tr key={i}>
        <td>{doc.id}</td>
        <td>{doc.title}</td>
        <td>{doc.department}</td>
        <td>
          <span
            className={`${styles.badge} ${
              doc.status === "Completed"
                ? styles.completed
                : doc.status === "In-Process"
                ? styles.inProcess
                : doc.status === "Awaiting Signatures"
                ? styles.pending
                : doc.status === "Awaiting-Completion"
                ? styles.awaiting
                : doc.status === "On Hold"
                ? styles.onHold
                : styles.pending
            }`}
          >
            {doc.status}
          </span>
        </td>
        <td>{doc.dateCreated}</td>
        <td>
          <a
            href="#"
            onClick={() => setSelectedDoc(doc)}
            className={`${styles.actionBtn} ${styles.viewBtn}`}
          >
            View
          </a>{" "}
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => {
              setSelectedDoc(doc);
              setIsModalOpen(true);

            }}
          >
            Delete
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr className={styles.noDataRow}>
      <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
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

              
      {/* Top Section */}
      <div className={styles.modalTop}>
        <h3 className={styles.modalTitle}>{selectedDoc.title}</h3>
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

      {/* Meta Data */}
      <div className={styles.metaGrid}>
        <div className={styles.metaLabelRow}>
          <span>Creator:</span>
          <span>Department:</span>
          <span>Type:</span>
          <span>Date:</span>
        </div>
        <div className={styles.metaValueRow}>
          <p>{selectedDoc.creator}</p>
          <p>{selectedDoc.department}</p>
          <p>{selectedDoc.type}</p>
          <p>{selectedDoc.dateCreated}</p>
        </div>
      </div>

      {/* Preview Section */}
      <div className={styles.previewSection}>
        <h4>Document Preview</h4>
        {selectedDoc.previewUrl ? (
          <iframe
            src={`${selectedDoc.preview}#toolbar=0&navpanes=0&scrollbar=0`}
            title="Document Preview"
            className={styles.previewFrame}
          ></iframe>
        ) : (
          <p className={styles.noPreview}>No preview available</p>
        )}
      </div>
    </div>
  </div>
)}


        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.deletemodalContent}>
              <h3 className={styles.deletemodalTitle}>Confirm Deletion</h3>
              <p>Are you sure you want to delete this document? This action can be undone by restore.</p>
              <div className={styles.modalActions}>
                <button onClick={handleCloseModal} className={styles.deletecancelButton}>Cancel</button>
                <button onClick={handleConfirmDelete} className={styles.deleteButton}>Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className={styles.successmodalOverlay}>
            <div className={styles.modal}>
              <h3 className={styles.successmodalTitle}>Success!</h3>
              <p>Document deleted successfully!</p>
              <div className={styles.modalActions}>
                <button
                  onClick={handleCloseSuccess}
            
                  className={styles.closeButtonx}
                >
                  Close
                </button>
              </div>
              
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
}
