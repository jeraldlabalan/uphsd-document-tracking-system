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
import { Activity, FileText, Users } from "lucide-react";
import { fetchFilterData, FilterData } from "@/lib/filterData";
import Loading from "@/app/loading";

// const cookieStore = await cookies();

type Log = {
  LogID: number; // Adjust to match your DB column
  Action: string;
  TargetType: string;
  Timestamp: string;
  User?: {
    FirstName: string;
    LastName: string;
    Department?: { Name: string };
    Role?: { RoleName: string };
  };
};

export default function ActivityLogs() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Log | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [selectedUser, setSelectedUser] = useState<Log["User"] | null>(null);
  const [filterData, setFilterData] = useState<FilterData>({
    documentTypes: [],
    departments: [],
    statuses: [],
  });
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showRestoreLoading, setShowRestoreLoading] = useState(false);
  const [showConfirmSuccess, setShowConfirmSuccess] = useState(false);
  const [showConfirmPermanentDelete, setShowConfirmPermanentDelete] =
    useState(false);
  const [showPermanentDeleteLoading, setShowPermanentDeleteLoading] =
    useState(false);
  const [showSuccessPermanentDelete, setShowSuccessPermanentDelete] =
    useState(false);

  // Add state for summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalActivityToday: 0,
    documentActivityToday: 0,
    userActivityToday: 0,
  });

  // Common target types for activity logs
  const targetTypes = [
    "Document",
    "DocumentVersion",
    "DocumentRequest",
    "SignaturePlaceholder",
    "User",
    "Department",
    "Role",
    "Notification",
  ];

  // Fetch summary statistics
  const fetchSummaryStats = async () => {
    try {
      const summaryRes = await fetch("/api/admin/activity-logs?summary=true", {
        method: "GET",
        credentials: "include",
      });

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummaryStats(summaryData);
      }
    } catch (error) {
      console.error("Error fetching summary stats:", error);
    }
  };

  // Fetch summary stats on mount and when filters change
  useEffect(() => {
    fetchSummaryStats();
  }, [targetFilter, departmentFilter, dateFrom]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true); // ✅ start loader

        // Fetch activity logs
        const params = new URLSearchParams();
        if (targetFilter) params.append("targetType", targetFilter);
        if (departmentFilter) params.append("department", departmentFilter);
        if (dateFrom) params.append("date", dateFrom);

        const resLogs = await fetch(
          `/api/admin/activity-logs?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        let logsData: Log[] = [];
        if (resLogs.ok) {
          const dataLogs = await resLogs.json();
          logsData = (dataLogs || []) as Log[];
        } else {
          console.error("Failed to fetch logs");
        }
        setLogs(logsData);

        // Fetch filter data
        const filterData = await fetchFilterData();
        setFilterData(filterData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLogs([]);
        setFilterData({
          documentTypes: [],
          departments: [],
          statuses: [],
        });
      } finally {
        setLoading(false); // ✅ stop loader after both fetches
      }
    };

    fetchAllData();
  }, [targetFilter, departmentFilter, dateFrom]); // Re-fetch on filter change

  // const activityLogs = [
  //   {
  //     id: "ACT001",
  //     activity: "Document Deleted",
  //     user: "Naruto Uzumaki",
  //     target: "hr-policy.pdf",
  //     status: "Completed",
  //     dateCreated: "2025-07-30",
  //   },
  //   {
  //     id: "ACT002",
  //     activity: "Document Restored",
  //     user: "Sasuke Uchiha",
  //     target: "finance-q3-request.pdf",
  //     status: "Completed",
  //     dateCreated: "2025-07-29",
  //   },
  //   {
  //     id: "ACT003",
  //     activity: "User Deactivated",
  //     user: "Kakashi Hatake",
  //     target: "HR Department",
  //     status: "Pending",
  //     dateCreated: "2025-07-29",
  //   },
  // ];

  const filteredLogs = logs.filter((log) => {
    const searchMatch =
      !search ||
      log.User?.FirstName?.toLowerCase().includes(search.toLowerCase()) ||
      log.User?.LastName?.toLowerCase().includes(search.toLowerCase()) ||
      log.Action?.toLowerCase().includes(search.toLowerCase());
    return searchMatch;
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
  const logsPerPage = 5;

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading) {
    return <Loading />;
  }
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
              <Activity className={styles.icon} />
              <span className={styles.count}>
                {summaryStats.totalActivityToday}
              </span>
              <span>Total Activities Today</span>
            </div>

            <div className={`${styles.card} ${styles.cyan}`}>
              <FileText className={styles.icon} />
              <span className={styles.count}>
                {summaryStats.documentActivityToday}
              </span>
              <span>Document Activities Today</span>
            </div>

            <div className={`${styles.card} ${styles.green}`}>
              <Users className={styles.icon} />
              <span className={styles.count}>
                {summaryStats.userActivityToday}
              </span>
              <span>User Activities Today</span>
            </div>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search activities..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className={styles.dropdown}
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
            >
              <option value="">All Targets</option>
              {targetTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              className={styles.dropdown}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {filterData.departments.map((department) => (
                <option key={department.DepartmentID} value={department.Name}>
                  {department.Name}
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
          <div className={styles.tableWrapper}>
            <table className={styles.docTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Activity</th>
                  <th>User</th>
                  <th>Target</th>
                  <th>Department</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log, i) => (
                    <tr key={i}>
                      <td>{log.LogID}</td>
                      <td>{log.Action}</td>
                      <td>{log.User?.FirstName + " " + log.User?.LastName}</td>
                      <td>{log.TargetType}</td>
                      <td>{log.User?.Department?.Name}</td>
                      <td>{log.Timestamp}</td>
                    </tr>
                  ))
                ) : (
                  <tr className={styles.noDataRow}>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", padding: "1rem" }}
                    >
                      {search ? (
                        <>
                          No logs found for &quot;<strong>{search}</strong>
                          &quot;
                        </>
                      ) : (
                        <>No logs available.</>
                      )}
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
