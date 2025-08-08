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
            <div className={`${styles.card} ${styles.orange}`}>
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
                placeholder="Search users..."
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
                <th>Activity</th>
                <th>Creator</th>
                <th>Department</th>
                <th>Date of Activity</th>
                <th>Action</th>
              </tr>
            </thead>
          <tbody>
  {filteredDocs.length > 0 ? (
    filteredDocs.map((doc, i) => (
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

        {/* confirm restore modal */}
        {showConfirmRestore && (
          <div
            className={styles.modal}
            onClick={(e) =>
              handleBackdropClick(e, () => setShowConfirmRestore(false))
            }
          >
            <div className={styles.modalContent}>
              <div className={styles.confirmRestoreContainer}>
                <h1>document restore</h1>

                <p>Are you sure to restore this document?</p>

                <div className={styles.confirmRestoreActionButton}>
                  <button
                    onClick={(e) =>
                      handleCancelButtonClick(e, () =>
                        setShowConfirmRestore(false)
                      )
                    }
                  >
                    Cancel
                  </button>
                  <button onClick={handleRestoreSuccess}>Confirm</button>
                </div>
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
          <div
            className={styles.modal}
            onClick={(e) =>
              handleBackdropClick(e, () => setShowConfirmSuccess(false))
            }
          >
            <div className={styles.modalContent}>
              <div className={styles.confirmSuccessContainer}>
                <h1>success!</h1>

                <p>The document has been successfully restored!</p>

                <button
                  onClick={(e) =>
                    handleCancelButtonClick(e, () =>
                      setShowConfirmSuccess(false)
                    )
                  }
                >
                  okay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* confirm permanent delete modal */}
        {showConfirmPermanentDelete && (
          <div
            className={styles.modal}
            onClick={(e) =>
              handleBackdropClick(e, () => setShowConfirmPermanentDelete(false))
            }
          >
            <div className={styles.modalContent}>
              <div className={styles.confirmPermanentDeleteContainer}>
                <h1>permanently delete</h1>

                <p>
                  Are you sure to delete this document? This action cannot be
                  undone.
                </p>

                <div className={styles.confirmPermanentDeleteActionButton}>
                  <button
                    onClick={(e) =>
                      handleCancelButtonClick(e, () =>
                        setShowConfirmPermanentDelete(false)
                      )
                    }
                  >
                    Cancel
                  </button>
                  <button onClick={handleSuccessPermanentDelete}>
                    Confirm
                  </button>
                </div>
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
          <div
            className={styles.modal}
            onClick={(e) =>
              handleBackdropClick(e, () => setShowSuccessPermanentDelete(false))
            }
          >
            <div className={styles.modalContent}>
              <div className={styles.confirmSuccessContainer}>
                <h1>success!</h1>

                <p>The document has been permanently deleted!</p>

                <button
                  onClick={(e) =>
                    handleCancelButtonClick(e, () =>
                      setShowSuccessPermanentDelete(false)
                    )
                  }
                >
                  okay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
