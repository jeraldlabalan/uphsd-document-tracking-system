"use client";

import { useState, useEffect } from "react";
import styles from "./documentOverview.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import { Search as SearchIcon } from "lucide-react";
import { X, FileCheck, FileText, Trash2 } from "lucide-react";

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

  const handleDownload = () => {
    // optional
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleCloseSuccess = () => setShowSuccessModal(false);
  const handleCloseStatusUpdate = () => setShowStatusUpdateModal(false);

  async function handleUpdateDocumentStatuses() {
    try {
      const res = await fetch("/api/admin/update-document-statuses", {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update document statuses");
      }
      
      const data = await res.json();
      setStatusUpdateMessage(data.message);
      setShowStatusUpdateModal(true);
      
      // Reload data to reflect changes
      await loadData();
    } catch (error: any) {
      console.error("Error updating document statuses:", error);
      setStatusUpdateMessage(`Error: ${error.message}`);
      setShowStatusUpdateModal(true);
    }
  }

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
      setShowSuccessModal(true);
      await loadData();
    } catch (e) {
      console.error(e);
      setIsModalOpen(false);
    }
  }

  return (
    <div>
      <AdminHeader />
      <div className={styles.container}>
        <div className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Document Overview</h2>
            <button 
              onClick={handleUpdateDocumentStatuses}
              className={styles.statusUpdateBtn}
              title="Update any existing documents with 'Active' status to 'In-Process'"
            >
              Update Document Statuses
            </button>
          </div>
          <hr className={styles.separator} />

          <div className={styles.summary}>
            <div className={`${styles.card} ${styles.green}`}>

              <CheckCircle className={styles.icon} />
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
              <option>In-Process</option>
              <option>Awaiting Signatures</option>
              <option>Awaiting-Completion</option>
              <option>Completed</option>
              <option>On Hold</option>
            </select>

            <select className={styles.dropdown} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
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
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, i) => (
                  <tr key={i}>
                    <td>{doc.id}</td>
                    <td>{doc.title}</td>
                    <td>{doc.department}</td>
                    <td>
                      <span className={`${styles.badge} ${
                        doc.status === "Completed" ? styles.completed : 
                        doc.status === "In-Process" ? styles.inProcess : 
                        doc.status === "Awaiting Signatures" ? styles.pending :
                        doc.status === "Awaiting-Completion" ? styles.pending :
                        doc.status === "On Hold" ? styles.onHold : 
                        styles.pending
                      }`}>

                        {doc.status}
                      </span>


                    </td>
                    <td>{doc.dateCreated}</td>
                    <td>
                      <a href="#" onClick={() => setSelectedDoc(doc)} className={`${styles.actionBtn} ${styles.viewBtn}`}>
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
        </div>

        {selectedDoc && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <button className={styles.closeButton} onClick={() => setSelectedDoc(null)} aria-label="Close Modal">
                <X size={20} />
              </button>

              <div className={styles.modalTop}>
                <h3 className={styles.modalTitle}>{selectedDoc.title}</h3>
                <span className={`${styles.badge} ${
                  selectedDoc.status === "Completed" ? styles.completed : 
                  selectedDoc.status === "In-Process" ? styles.inProcess : 
                  selectedDoc.status === "Awaiting Signatures" ? styles.pending :
                  selectedDoc.status === "Awaiting-Completion" ? styles.pending :
                  selectedDoc.status === "On Hold" ? styles.onHold : 
                  styles.pending
                }`}>
                  {selectedDoc.status}
                </span>

              </div>

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
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className={styles.deletemodalOverlay}>
            <div className={styles.modal}>
              <h3 className={styles.deletemodalTitle}>Confirm Deletion</h3>
              <p>Are you sure you want to delete this document? This action can be undone by restore.</p>
              <div className={styles.modalActions}>
                <button onClick={handleCloseModal} className={styles.cancelButton}>Cancel</button>
                <button onClick={handleConfirmDelete} className={styles.confirmButton}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Success!</h3>
                <button onClick={handleCloseSuccess} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalContent}>
                <p>Document deleted successfully!</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusUpdateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Status Update Result</h3>
                <button onClick={handleCloseStatusUpdate} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalContent}>
                <p>{statusUpdateMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
