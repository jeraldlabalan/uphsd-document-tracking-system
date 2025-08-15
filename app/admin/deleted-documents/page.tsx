"use client";

import { useState, useEffect } from "react";
import styles from "./deletedDocuments.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import { Search as SearchIcon } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Trash2, FileText } from "lucide-react";
import Loading from "@/app/loading";

type DeletedDocument = {
  DocumentID: number;
  Title: string;
  Description: string;
  UpdatedAt: string;
  Status: string;
  Creator: {
    FirstName: string;
    LastName: string;
    Department: { Name: string };
  };
  DocumentType: {
    TypeName: string;
  };
};

export default function DeletedDocuments() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [documents, setDocuments] = useState<DeletedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DeletedDocument | null>(null);
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
    totalDeleted: 0,
    totalRestored: 0,
  });

  // Fetch summary statistics
  const fetchSummaryStats = async () => {
    try {
      const summaryRes = await fetch(
        "/api/admin/deleted-documents?summary=true",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummaryStats(summaryData);
      }
    } catch (error) {
      console.error("Error fetching summary stats:", error);
    }
  };

  // Fetch deleted documents
  const fetchDeletedDocuments = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/deleted-documents", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      } else {
        console.error("Failed to fetch deleted documents");
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching deleted documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchDeletedDocuments();
    fetchSummaryStats();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const searchMatch =
      !search ||
      doc.Title?.toLowerCase().includes(search.toLowerCase()) ||
      doc.DocumentID?.toString().includes(search.toLowerCase());

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

  const handleRestoreDocument = async () => {
    if (!selectedDoc) return;

    try {
      setShowRestoreLoading(true);

      const res = await fetch("/api/admin/deleted-documents", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          documentId: selectedDoc.DocumentID,
          action: "restore",
        }),
      });

      if (res.ok) {
        setShowRestoreLoading(false);
        setShowConfirmSuccess(true);
        // Refresh the documents list
        fetchDeletedDocuments();
        fetchSummaryStats();
      } else {
        console.error("Failed to restore document");
        setShowRestoreLoading(false);
      }
    } catch (error) {
      console.error("Error restoring document:", error);
      setShowRestoreLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedDoc) return;

    try {
      setShowPermanentDeleteLoading(true);

      const res = await fetch("/api/admin/deleted-documents", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          documentId: selectedDoc.DocumentID,
          action: "permanent-delete",
        }),
      });

      if (res.ok) {
        setShowPermanentDeleteLoading(false);
        setShowSuccessPermanentDelete(true);
        // Refresh the documents list
        fetchDeletedDocuments();
        fetchSummaryStats();
      } else {
        console.error("Failed to permanently delete document");
        setShowPermanentDeleteLoading(false);
      }
    } catch (error) {
      console.error("Error permanently deleting document:", error);
      setShowPermanentDeleteLoading(false);
    }
  };

  // for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const docsPerPage = 5;

  const totalPages = Math.ceil(filteredDocs.length / docsPerPage);

  const startIndex = (currentPage - 1) * docsPerPage;
  const endIndex = startIndex + docsPerPage;

  const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

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
            <h2 className={styles.pageTitle}>Deleted Documents</h2>
          </div>
          <hr className={styles.separator} />

          <div className={styles.summary}>
            <div className={`${styles.card} ${styles.red}`}>
              <Trash2 className={styles.icon} />
              <span className={styles.count}>{summaryStats.totalDeleted}</span>
              <span>Total Deleted Documents</span>
            </div>

            <div className={`${styles.card} ${styles.cyan}`}>
              <FileText className={styles.icon} />
              <span className={styles.count}>{summaryStats.totalRestored}</span>
              <span>Total Restored Documents</span>
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
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.docTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Creator</th>
                  <th>Department</th>
                  <th>Document Type</th>
                  <th>Status</th>
                  <th>Date Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDocs.length > 0 ? (
                  paginatedDocs.map((doc, i) => (
                    <tr key={i}>
                      <td>{doc.DocumentID}</td>
                      <td>{doc.Title}</td>
                      <td>
                        {doc.Creator.FirstName + " " + doc.Creator.LastName}
                      </td>
                      <td>{doc.Creator.Department.Name}</td>
                      <td>{doc.DocumentType.TypeName}</td>
                      <td>{doc.Status}</td>
                      <td>{new Date(doc.UpdatedAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className={`${styles.actionBtn} ${styles.restoreBtn}`}
                          onClick={() => {
                            setSelectedDoc(doc);
                            setShowConfirmRestore(true);
                          }}
                        >
                          Restore
                        </button>{" "}
                        {/* <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => {
              setSelectedDoc(doc);
              setShowConfirmPermanentDelete(true);
            }}
          >
            Permanently Delete
          </button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className={styles.noDataRow}>
                    <td
                      colSpan={8}
                      style={{ textAlign: "center", padding: "1rem" }}
                    >
                      {search ? (
                        <>
                          No deleted documents found for &quot;
                          <strong>{search}</strong>&quot;
                        </>
                      ) : (
                        <>No deleted documents available.</>
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
            className={styles.modalOverlay}
            onClick={(e) =>
              handleBackdropClick(e, () => setShowConfirmRestore(false))
            }
          >
            <div className={styles.restoremodalContent}>
              <h3 className={styles.restoremodalTitle}>Document Restore</h3>
              <p>Are you sure to restore this document?</p>
              <div className={styles.modalActions}>
                <button
                  onClick={(e) =>
                    handleCancelButtonClick(e, () =>
                      setShowConfirmRestore(false)
                    )
                  }
                  className={styles.restorecancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreDocument}
                  className={styles.restoreButton}
                >
                  Continue
                </button>
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
            className={styles.successmodalOverlay}
            onClick={(e) =>
              handleBackdropClick(e, () => setShowConfirmSuccess(false))
            }
          >
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
                <button
                  onClick={(e) =>
                    handleCancelButtonClick(e, () =>
                      setShowConfirmPermanentDelete(false)
                    )
                  }
                  className={styles.deletecancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermanentDelete}
                  className={styles.deleteButton}
                >
                  Continue
                </button>
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
            className={styles.successmodalOverlay}
            onClick={(e) =>
              handleBackdropClick(e, () => setShowSuccessPermanentDelete(false))
            }
          >
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
