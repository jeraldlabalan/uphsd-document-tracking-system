"use client";

import { useState, useEffect } from "react";

import styles from "./activityLogs.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import { Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import { X } from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { CheckCircle, Clock, PauseCircle } from "lucide-react";

// const cookieStore = await cookies();


type Log = {
  Timestamp: string;
  Action: string;
  TargetType: string;
  // Add other properties as needed
};

export default function ActivityLogs() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showRestoreLoading, setShowRestoreLoading] = useState(false);
  const [showConfirmSuccess, setShowConfirmSuccess] = useState(false);
  const [showConfirmPermanentDelete, setShowConfirmPermanentDelete] =
    useState(false);
  const [showPermanentDeleteLoading, setShowPermanentDeleteLoading] =
    useState(false);
  const [showSuccessPermanentDelete, setShowSuccessPermanentDelete] =
    useState(false);

  const activityLogs = [
    {
      id: "ACT001",
      activity: "Document Deleted",
      user: "Naruto Uzumaki",
      target: "hr-policy.pdf",
      status: "Completed",
      dateCreated: "2025-07-30",
    },
    {
      id: "ACT002",
      activity: "Document Restored",
      user: "Sasuke Uchiha",
      target: "finance-q3-request.pdf",
      status: "Completed",
      dateCreated: "2025-07-29",
    },
    {
      id: "ACT003",
      activity: "User Deactivated",
      user: "Kakashi Hatake",
      target: "HR Department",
      status: "Pending",
      dateCreated: "2025-07-29",
    },
  ];

  const filteredLogs = activityLogs.filter((log) => {
    const searchMatch =
      !search ||
      log.user?.toLowerCase().includes(search.toLowerCase()) ||
      log.activity?.toLowerCase().includes(search.toLowerCase()) ||
      log.target?.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      !statusFilter || log.status?.toLowerCase() === statusFilter.toLowerCase();

    const logDate = new Date(log.dateCreated);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const dateMatch =
      (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate);

    return searchMatch && dateMatch && statusMatch;
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
            <h2 className={styles.pageTitle}>Activity Logs</h2>
          </div>
          <hr className={styles.separator} />

          <div className={styles.summary}>
            <div className={`${styles.card} ${styles.orange}`}>
              <CheckCircle className={styles.icon} />
              <span className={styles.count}>116</span>
              <span>Total Activity Today</span>
            </div>

            <div className={`${styles.card} ${styles.cyan}`}>
              <Clock className={styles.icon} />
              <span className={styles.count}>3</span>
              <span>Document Action</span>
            </div>

            <div className={`${styles.card} ${styles.green}`}>
              <Clock className={styles.icon} />
              <span className={styles.count}>3</span>
              <span>User Action</span>
            </div>

            <div className={`${styles.card} ${styles.yellow}`}>
              <Clock className={styles.icon} />
              <span className={styles.count}>3</span>
              <span>Total Documents</span>
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
                <th>User</th>
                <th>Target</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, i) => (
                <tr key={i}>
                  <td>{log.id}</td>
                  <td>{log.activity}</td>
                  <td>{log.user}</td>
                  <td>{log.target}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        log.status === "Completed"
                          ? styles.completed
                          : log.status === "In Process"
                            ? styles.inProcess
                            : log.status === "On Hold"
                              ? styles.onHold
                              : styles.pending
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>

                  <td>{log.dateCreated}</td>
                </tr>
              ))}
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
