"use client";
import { useState, useEffect } from "react";
import styles from "./receivedocsStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon, X, FileText, Inbox, FileX } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";


type ReceivedDocument = {
  id: number;
  name: string;
  file: string;
  status: string;
  date: string;
  type: string;
  creator: string;
  preview: string;
};

export default function ReceiveDocuments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<ReceivedDocument | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [showConfirmSuccess, setShowConfirmSuccess] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [docs, setDocs] = useState<ReceivedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [approvedDocs, setApprovedDocs] = useState<number[]>([]); // to track approved documents



  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/employee/documents/received-docs");
        const data = await res.json();
        if (res.ok) {
          setDocs(data.docs);
        } else {
          console.error(data.error || "Failed to fetch documents");
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
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

  const filteredDocs = docs.filter((doc) => {
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

  const handleApprove = async (requestId: number) => {
  try {
    setIsApproving(true);
    
    const response = await fetch("/api/employee/documents/received-docs/approved", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Document approved successfully:", data);
      toast.success("Document approved successfully!");
      
      // ✅ Auto-close the modal
      setSelectedDoc(null);
      // ✅ Add to approved docs state
      setApprovedDocs((prev) => [...prev, requestId]);    
      window.location.reload();
    } else {
      toast.error(data.error || "Failed to approve document.");
    }
  } catch (error) {
    console.error("Error approving document:", error);
    toast.error("Something went wrong.");
  } finally {
    setIsApproving(false);
  }
};

  const handleDownload = () => {
    if (!selectedDoc?.name) return;
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

  // Handles backdrop clicks
  const handleBackdropClick = (e: React.MouseEvent, closeFn: () => void) => {
    if (e.target === e.currentTarget) {
      closeFn();
    }
  };


  const handleView = (doc: ReceivedDocument) => {
    setSelectedDoc(doc);
    // setOpenModal(true); // ❌ remove this if you don't use it
  };

  // Handles clicking the "Okay" button
  const handleCancelButtonClick = (
    e: React.MouseEvent,
    closeFn: () => void
  ) => {
    e.stopPropagation();
    closeFn();
  };

  // Confirm button logic
const handleConfirmClick = async () => {
  if (!remarks.trim()) {
    toast.error("Please enter your remarks.");
    return;
  }

  if (!selectedDoc) {
    toast.error("No document selected.");
    return;
  }

  try {
    const res = await fetch("/api/employee/documents/received-docs/hold-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId: selectedDoc.id,
        remark: remarks,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Document placed on hold!");

      setShowOnHoldModal(false);
      setShowConfirmSuccess(true);
      setRemarks("");
      setSelectedDoc(null);

      // Optional: refresh docs after hold
      setDocs((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === selectedDoc.id
            ? { ...doc, status: "On-Hold" }
            : doc
        )
      );
    } else {
      toast.error(data.error || "Failed to put document on hold.");
    }
  } catch (error) {
    console.error("Error putting on hold:", error);
    toast.error("Something went wrong.");
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
      {loading ? ( // 👈 Loading state
        <tr>
          <td colSpan={6} style={{ textAlign: "center", padding: "2rem 0" }}>
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
            <td>{doc.type}</td>
            <td>
              <span
                className={`${styles.badge} 
                  ${doc.status === "In-Process" 
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
              <a href="#" onClick={() => setSelectedDoc(doc)}>View</a>
            </td>
          </tr>
        ))
      ) : (
        <tr className={styles.noDataRow}>
          <td colSpan={6} style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <FileX size={40} color="#999" />
              <span style={{ fontSize: "1rem", color: "#777" }}>No documents found.</span>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  </table>
) : (
  <div className={styles.cardGrid}>
    {loading ? ( // 👈 Loading state for card view
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
                ${doc.status === "In-Process" 
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
          <p><strong className={styles.highlighted}>File:</strong> {doc.file}</p>
          <p><strong className={styles.highlighted}>Type:</strong> {doc.type}</p>
          <p><strong className={styles.highlighted}>Date:</strong> {doc.date}</p>
          <p><strong className={styles.highlighted}>Creator:</strong> {doc.creator}</p>
          <div className={styles.cardActions}>
            <button onClick={() => handleView(doc)}>View</button>
          </div>
        </div>
      ))
    ) : (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", marginTop: "2rem" }}>
        <FileX size={40} color="#999" />
        <span style={{ fontSize: "1rem", color: "#777" }}>No documents found.</span>
      </div>
    )}
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
                              className={`${styles.badge} 
                                ${selectedDoc.status === "In-Process" 
                                  ? styles.inProcess 
                                  : selectedDoc.status === "Completed" 
                                    ? styles.completed 
                                    : selectedDoc.status === "On-Hold" 
                                      ? styles.onHold 
                                      : selectedDoc.status === "Approved" 
                                        ? styles.approved 
                                        : selectedDoc.status === "Awaiting-Completion" 
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
                <button
                  className={styles.Approve}
                  onClick={() => handleApprove(selectedDoc.id)}
                  disabled={isApproving}
                >
                  {isApproving ? "Approving..." : "Approve"}
                </button>
                <button className={styles.OnHold} onClick={() => setShowOnHoldModal(true)}>On Hold</button>
                <button className={styles.print} onClick={handlePrint}>Print</button>
              </div>
            </div>
          </div>
        )}

        {/* confirm restore modal */}
        {showOnHoldModal && (

          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.confirmRestoreContainer}>
                <h2>ON HOLD</h2>


                <div>
                  <label htmlFor="remarks" style={{ fontWeight: 500, fontSize: "1rem" }}>Remarks:</label>
                  <textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter your remarks here..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      marginTop: '10px',
                      padding: '10px',
                      fontSize: '0.95rem',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      resize: 'none'
                    }}
                  />

                  <div className={styles.confirmRestoreActionButton}>
                    <button onClick={() => setShowOnHoldModal(false)}>Close</button>
                    <button className={styles.restoreBtn} onClick={handleConfirmClick}>Confirm</button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Success modal */}
        {showConfirmSuccess && (
          <div
            className={styles.modal}
            onClick={(e) => handleBackdropClick(e, () => setShowConfirmSuccess(false))}
          >
            <div className={styles.modalContent}>
              <div className={styles.confirmSuccessContainer}>
                <h1>Success!</h1>
                <p>The remarks have been successfully sent!</p>
                <button
                  className={styles.restoreBtn}
                  onClick={(e) =>
                    handleCancelButtonClick(e, () => setShowConfirmSuccess(false))
                  }
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
