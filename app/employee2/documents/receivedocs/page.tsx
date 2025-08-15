"use client";
import { useState, useEffect } from "react";
import styles from "./receivedocsStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon, X, FileText, Inbox, FileX } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { fetchFilterData, FilterData } from "@/lib/filterData";
import Loading from "@/app/loading";
import AOS from "aos";
import "aos/dist/aos.css";


type ReceivedDocument = {
  requestID: number;
  documentID: number;
  title: string;
  description: string;
  type: string;
  department: string;
  creator: {
    UserID: number;
    FirstName: string;
    LastName: string;
    Email: string;
  };
  status: string;
  documentStatus: string;
  requestedAt: string;
  completedAt: string | null;
  priority: string;
  remarks: string;
  latestVersion: {
    versionID: number;
    versionNumber: number;
    filePath: string;
  } | null;
  signaturePlaceholders: Array<{
    placeholderID: number;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    assignedToID: number;
    assignedTo: {
      UserID: number;
      FirstName: string;
      LastName: string;
    };
    isSigned: boolean;
    signedAt: string | null;
    signatureData: string | null;
  }>;
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
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [filterData, setFilterData] = useState<FilterData>({
    documentTypes: [],
    departments: [],
    statuses: []
  });
  const [isApproving, setIsApproving] = useState(false);
  const [approvedDocs, setApprovedDocs] = useState<number[]>([]); // to track approved documents

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

      // Fetch received documents
      const resDocs = await fetch("/api/employee/documents/received-docs");
      let receivedDocs: any[] = [];
      if (resDocs.ok) {
        const dataDocs = await resDocs.json();
        console.log("Received documents data:", dataDocs);
        receivedDocs = dataDocs.receivedDocuments || [];
      } else {
        console.error("Failed to fetch received documents");
      }
      setDocs(receivedDocs);

      // Fetch filter data
      const filterData = await fetchFilterData();
      setFilterData(filterData);

    } catch (err) {
      console.error("Error fetching data:", err);
      setDocs([]);
      setFilterData([]);
    } finally {
      setLoading(false); // ✅ stop loader after both fetches
    }
  };

  fetchAllData();
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
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.documentID.toString().includes(search);

  const matchesStatus = !statusFilter || doc.status === statusFilter;
  const matchesType = !typeFilter || doc.type === typeFilter;
  const matchesDepartment =
    !departmentFilter || doc.department === departmentFilter;

  const docDate = new Date(doc.requestedAt);
  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(dateTo) : null;
  const matchesDate =
    (!fromDate || docDate >= fromDate) &&
    (!toDate || docDate <= toDate);

  return (
    matchesSearch &&
    matchesStatus &&
    matchesType &&
    matchesDepartment &&
    matchesDate
  );
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
    if (!selectedDoc?.latestVersion?.filePath) return;
    const link = document.createElement("a");
    link.href = selectedDoc.latestVersion.filePath;
    link.download = `document-${selectedDoc.documentID}.pdf`;
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
        requestId: selectedDoc.requestID,
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
          doc.requestID === selectedDoc.requestID
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



if (loading) {
    return <Loading />;
  }

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
            <Link href="/employee2/documents" className={styles.backLink}>
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
  paginatedDocs.map((doc, i) => (
    <tr key={i}>
            <td>{doc.documentID}</td>
            <td>{doc.title}</td>
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
            <td>{new Date(doc.requestedAt).toLocaleDateString()}</td>
            <td className={styles.actions}>
              <a href="#" onClick={() => {
                console.log("Selected document:", doc);
                setSelectedDoc(doc);
              }}>View</a>
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
  <div data-aos="fade-up" className={styles.cardGrid}>
    {loading ? ( // 👈 Loading state for card view
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading documents...</p>
      </div>
    ) : filteredDocs.length > 0 ? (
              paginatedDocs.map((doc) => (
        <div key={doc.documentID} className={styles.cardItem}>
          <div className={styles.cardTop}>
            <h3 className={styles.highlighted}>{doc.title}</h3>
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
          <p><strong className={styles.highlighted}>Type:</strong> {doc.type}</p>
          <p><strong className={styles.highlighted}>Department:</strong> {doc.department}</p>
          <p><strong className={styles.highlighted}>Date:</strong> {new Date(doc.requestedAt).toLocaleDateString()}</p>
          <p><strong className={styles.highlighted}>Creator:</strong> {`${doc.creator.FirstName} ${doc.creator.LastName}`}</p>
          <div className={styles.cardActions}>
            <button onClick={() => {
              console.log("Selected document (card):", doc);
              setSelectedDoc(doc);
            }}>View</button>
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


        {/* Modal */}
        {selectedDoc && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard} data-aos="zoom-in">
              <button className={styles.closeButton} onClick={() => setSelectedDoc(null)} aria-label="Close">
                <X size={20} />
              </button>

              <div className={styles.modalTop}>
                <h3 className={styles.modalTitle}>{selectedDoc.title}</h3>
                <span className={`${styles.badge} ${
                  selectedDoc.status === "Completed" ? styles.completed : 

                  selectedDoc.status === "In-Process" ? styles.inProcess :
                  selectedDoc.status === "Approved" ? styles.approved :

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
                  <span>Department:</span>
                  <span>Date:</span>
                </div>
                <div className={styles.metaValueRow}>
                  <p>{`${selectedDoc.creator.FirstName} ${selectedDoc.creator.LastName}`}</p>
                  <p>{selectedDoc.type}</p>
                  <p>{selectedDoc.department}</p>
                  <p>{new Date(selectedDoc.requestedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className={styles.previewContainer}>
  {selectedDoc.latestVersion?.filePath ? (
    (() => {
      const isPDF = selectedDoc.latestVersion.filePath.match(/\.pdf$/i);
      
      if (isPDF) {
        return (
          <div>
            <iframe
              src={`${selectedDoc.latestVersion.filePath}#toolbar=0&navpanes=0&scrollbar=0`}
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
                <li><a href={selectedDoc.latestVersion.filePath} target="_blank" rel="noopener noreferrer">Open the file in a new tab</a></li>
                <li><a href={selectedDoc.latestVersion.filePath} download>Download the file directly</a></li>
              </ul>
            </div>
          </div>
        );
      } else {
        return (
          <div>
            <p>File type: {selectedDoc.latestVersion.filePath.split('.').pop()?.toUpperCase()}</p>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              This file type cannot be previewed in the browser.
            </p>
            <a
             
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadLink}
              href={selectedDoc.latestVersion.filePath} download
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

              <div className={styles.modalFooter}>
  {/* Left side buttons */}
  <div className={styles.footerLeft}>
    <button className={styles.download} onClick={handleDownload}>
      Download
    </button>
    <button
      className={styles.print}
      onClick={() => {
        if (selectedDoc.latestVersion?.filePath) {
          window.open(selectedDoc.latestVersion.filePath, "_blank", "noopener,noreferrer");
        } else {
          alert("No file available to print.");
        }
      }}
    >
      Print
    </button>
  </div>

  {/* Right side buttons */}
  <div className={styles.footerRight}>
    {!["Approved", "Awaiting-Completion", "Completed", "On-Hold"].includes(selectedDoc.status) && (
      <>
        <button
          className={styles.Approve}
          onClick={() => handleApprove(selectedDoc.requestID)}
          disabled={isApproving}
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
        <button
          className={styles.OnHold}
          onClick={() => setShowOnHoldModal(true)}
        >
          On Hold
        </button>
      </>
    )}
  </div>
</div>


            </div>
          </div>
        )}

        {/* confirm restore modal */}
        {showOnHoldModal && (

          <div className={styles.modal}>
            <div className={styles.modalContent} data-aos="zoom-in">
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
