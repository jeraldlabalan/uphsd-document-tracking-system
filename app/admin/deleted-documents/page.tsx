"use client";

import { useState, useEffect } from "react";
import styles from "./deletedDocuments.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import { Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import { X } from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { CheckCircle, Clock, PauseCircle } from "lucide-react";
import { fetchFilterData, FilterData } from "@/lib/filterData";

// const cookieStore = await cookies();
// const session = cookieStore.get("session");

// console.log("SESSION:", session); // ✅ prints to server logs

// if (!session) {
//   redirect("/login"); // or wherever you want
// }
type Documents = {
  id: string;
  name: string;
  file: string;
  preview: string;
  type: string;
  creator: string;
  department: string;
  status: string;
  dateCreated: string;
};

export default function DeletedDocuments() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    // Load filter data
    const loadFilterData = async () => {
      const data = await fetchFilterData();
      setFilterData(data);
    };
    loadFilterData();
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Documents | null>();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [selectedUser, setSelectedUser] = useState<Documents | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showRestoreLoading, setShowRestoreLoading] = useState(false);
  const [showConfirmSuccess, setShowConfirmSuccess] = useState(false);
  const [showConfirmPermanentDelete, setShowConfirmPermanentDelete] =
    useState(false);
  const [showPermanentDeleteLoading, setShowPermanentDeleteLoading] =
    useState(false);
  const [showSuccessPermanentDelete, setShowSuccessPermanentDelete] =
    useState(false);
  const [filterData, setFilterData] = useState<FilterData>({
    documentTypes: [],
    departments: [],
    statuses: []
  });

  const documents: Documents[] = [
    {
      id: "DOC001",
      name: "Naruto Uzumaki",
      file: "hr-policy.pdf",
      preview: "/files/hr-policy.pdf", // Example PDF path
      type: "Report",
      creator: "John Doe",
      department: "HR",
      status: "Pending",
      dateCreated: "2025-07-30",
    },
    {
      id: "DOC002",
      name: "Sasuke Uchiha",
      file: "finance-q3-request.pdf",
      preview: "/files/finance-q3-request.pdf",
      type: "Request",
      creator: "Jane Smith",
      department: "Finance",
      status: "Completed",
      dateCreated: "2025-07-29",
    },
    {
      id: "DOC003",
      name: "Kakashi Hatake",
      file: "finance-q3-request.pdf",
      preview: "/files/finance-q3-request.pdf",
      type: "Request",
      creator: "Jane Smith",
      department: "Finance",
      status: "On Hold",
      dateCreated: "2025-07-29",
    },
  ];

  const filteredDocs = documents.filter((doc) => {
    const statusMatch =
      !statusFilter || doc.status.toLowerCase() === statusFilter.toLowerCase();
    const typeMatch =
      !typeFilter || doc.type.toLowerCase() === typeFilter.toLowerCase();
    const searchMatch =
      !search ||
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.id?.toLowerCase().includes(search.toLowerCase());

    const docDate = new Date(doc.dateCreated);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const dateMatch =
      (!fromDate || docDate >= fromDate) && (!toDate || docDate <= toDate);

    return statusMatch && typeMatch && searchMatch && dateMatch;
  });

  const handleCancelButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    callback?: () => void
  ) => {
    e.stopPropagation();
    if (callback) callback();
  };

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    callback?: () => void
  ) => {
    if (e.target === e.currentTarget && callback) callback();
  };

  const handleRestoreSuccess = () => {
    setShowConfirmRestore(false);
    setShowRestoreLoading(true);

    setTimeout(() => {
      setShowRestoreLoading(false);
      setShowConfirmSuccess(true);
    }, 1000);
  };

  const handleSuccessPermanentDelete = () => {
    setShowConfirmPermanentDelete(false);
    setShowPermanentDeleteLoading(true);

    setTimeout(() => {
      setShowPermanentDeleteLoading(false);
      setShowSuccessPermanentDelete(true);
    }, 1000);
  };

  // for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const docsPerPage = 5; 


  const totalPages = Math.ceil(filteredDocs.length / docsPerPage);

  const startIndex = (currentPage - 1) * docsPerPage;
  const endIndex = startIndex + docsPerPage;

  const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));


  return (
    <div>
      <AdminHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Deleted Documents</h2>
          </div>
          <hr className={styles.separator} />

          <div className={styles.summary}>
            <div className={`${styles.card} ${styles.red}`}>
              <CheckCircle className={styles.icon} />
              <span className={styles.count}>116</span>
              <span>Total Documents Deleted</span>
            </div>

            <div className={`${styles.card} ${styles.cyan}`}>
              <Clock className={styles.icon} />
              <span className={styles.count}>3</span>
              <span>Total Documents Restored</span>
            </div>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search deleted documents..."
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
          <div className={styles.tableWrapper}>
          <table className={styles.docTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Activity</th>
                <th>Creator</th>
                <th>Department</th>
                <th>Date of Activity</th>
                <th>Action</th>
              </tr>
            </thead>
          <tbody>
  {paginatedDocs.length > 0 ? (
    paginatedDocs.map((doc, i) => (
      <tr key={i}>
        <td>{doc.id}</td>
        <td>
          {doc.status === "Completed"
            ? "Document Restored"
            : "Document Deleted"}
        </td>
        <td>{doc.creator}</td>
        <td>{doc.department}</td>
        <td>{doc.dateCreated}</td>
        <td>
          <a
            href="#"
            className={`${styles.actionBtn} ${styles.restoreBtn}`}
            onClick={() => {
              setSelectedDoc(doc);
              setShowConfirmRestore(true);
            }}
          >
            Restore
          </a>{" "}
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => {
              setSelectedUser(doc);
              setShowConfirmPermanentDelete(true);
            }}
          >
            Permanently Delete
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
       

        {/* confirm restore modal */}
         {showConfirmRestore && (
          <div className={styles.modalOverlay} onClick={(e) =>
              handleBackdropClick(e, () => setShowConfirmRestore(false))
            }>
            <div className={styles.restoremodalContent}>
              <h3 className={styles.restoremodalTitle}>Document Restore</h3>
              <p>Are you sure to restore this document?</p>
              <div className={styles.modalActions}>
                <button onClick={(e) =>
                      handleCancelButtonClick(e, () =>
                        setShowConfirmRestore(false)
                      )
                    } className={styles.restorecancelButton}>Cancel</button>
                <button onClick={handleRestoreSuccess} className={styles.restoreButton}>Continue</button>
              </div>
            </div>
          </div>
        )}


        {/* restore loading modal */}
        {showRestoreLoading && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.loadingContainer}>
                <div className={styles.spinnerGreen}></div>
              </div>
            </div>
          </div>
        )}

        {/* success restore modal */}
        {showConfirmSuccess && (
          <div className={styles.successmodalOverlay} onClick={(e) =>
              handleBackdropClick(e, () => setShowConfirmSuccess(false))
            }>
            <div className={styles.successModal}>
              <h3 className={styles.successmodalTitle}>Success!</h3>
              <p>The document has been successfully restored!</p>
              <div className={styles.modalActions}>
                <button
                  onClick={(e) =>
                    handleCancelButtonClick(e, () =>
                      setShowConfirmSuccess(false)
                    )
                  }
                  className={styles.closeButtonx}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* confirm permanent delete modal */}
         {showConfirmPermanentDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.deletemodalContent}>
              <h3 className={styles.deletemodalTitle}>Permanent Deletion</h3>
              <p>
                  Are you sure to delete this document? This action cannot be
                  undone.
                </p>
              <div className={styles.modalActions}>
                <button onClick={(e) =>
                      handleCancelButtonClick(e, () =>
                        setShowConfirmPermanentDelete(false)
                      )
                    } className={styles.deletecancelButton}>Cancel</button>
                <button onClick={handleSuccessPermanentDelete} className={styles.deleteButton}>Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* permanent delete loading modal */}
        {showPermanentDeleteLoading && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.loadingContainer}>
                <div className={styles.spinnerMaroon}></div>
              </div>
            </div>
          </div>
        )}

        {/* success permanent delete modal */}
        {showSuccessPermanentDelete && (
          <div className={styles.successmodalOverlay} onClick={(e) =>
              handleBackdropClick(e, () => setShowConfirmSuccess(false))
            }>
            <div className={styles.successModal}>
              <h3 className={styles.successmodalTitle}>Success!</h3>
              <p>The document has been permanently deleted!</p>
              <div className={styles.modalActions}>
                <button
                  onClick={(e) =>
                    handleCancelButtonClick(e, () =>
                      setShowSuccessPermanentDelete(false)
                    )
                  }
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
