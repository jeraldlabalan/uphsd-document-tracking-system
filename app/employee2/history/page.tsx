"use client";

import { useState, useEffect } from "react";
import styles from "./historyStyles.module.css"; // Reuse same styles
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon, X } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { fetchFilterData, FilterData } from "@/lib/filterData";

type DocumentVersionHistory = {
  VersionID: number;
  VersionNumber: number;
  CreatedAt: string;
  ChangeDescription: string;
  CreatedByUser: {
    FirstName: string;
    LastName: string;
  };
  Document: {
    Title: string;
    CreatedAt: string;
    DocumentType: {
      TypeName: string;
    }
  };
  ChangedByName: string;
};

export default function History() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [history, setHistory] = useState<DocumentVersionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterData, setFilterData] = useState<FilterData>({
    documentTypes: [],
    departments: [],
    statuses: []
  });

  const [selectedDoc, setSelectedDoc] = useState<DocumentVersionHistory | null>(null);
  const [showModal, setShowModal] = useState(false);

  // const historyData = [
  //   {
  //     document: "Final Budget FY2024",
  //     type: "Report",
  //     sender: "Matthew",
  //     department: "Finance",
  //     date: "June 12, 2025",
  //     dueDate: "June 20, 2025",
  //     status: "Completed",
  //   },
  //   {
  //     document: "Employee Feedback Form",
  //     type: "Evaluation",
  //     sender: "Donna",
  //     department: "HR",
  //     date: "May 28, 2025",
  //     dueDate: "June 5, 2025",
  //     status: "Completed",
  //   },
  //   {
  //     document: "Training Request Memo",
  //     type: "Request",
  //     sender: "Alex",
  //     department: "Learning & Dev",
  //     date: "May 15, 2025",
  //     dueDate: "May 20, 2025",
  //     status: "Completed",
  //   },
  // ];

   useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/employee/history"); // <-- replace with your actual route
        const data = await res.json();
        console.log("Fetched history data:", data);
        if (res.ok) {
          setHistory(data);
        } else {
          console.error("Failed to fetch history:", data.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadFilterData = async () => {
      const data = await fetchFilterData();
      setFilterData(data);
    };

    fetchHistory();
    loadFilterData();
  }, []);

const filtered = history.filter((item) => {
  const searchMatch =
    item.Document.Title.toLowerCase().includes(search.toLowerCase()) ||
    item.CreatedByUser?.FirstName?.toLowerCase().includes(search.toLowerCase()) ||
    item.ChangeDescription.toLowerCase().includes(search.toLowerCase());

  const typeMatch = !typeFilter || item.Document.Title === typeFilter;
  const deptMatch = !departmentFilter || item.ChangeDescription === departmentFilter;

  return searchMatch && typeMatch && deptMatch;
});


  const handleView = (entry: DocumentVersionHistory) => {
    setSelectedDoc(entry);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
  };

  // Pagination state
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5; // how many rows per page

// Calculate total pages
const totalPages = Math.ceil(filtered.length / itemsPerPage);

// Get current page's data
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedData = filtered.slice(startIndex, endIndex);

// Handlers
const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));


  return (
    <div>
      <EmpHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Version History</h2>
          </div>

          <hr className={styles.separator} />

          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

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
          </div>

          <table className={styles.docTable}>
            <thead>
              <tr>
                <th>Document</th>
                <th>Changed By</th>
                <th>Description</th>
                <th>Date</th>
                <th>Version</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
  {filtered.length > 0 ? (
    paginatedData.map((entry, index) => (
      <tr key={index}>
        <td>{entry.Document?.Title || "Untitled"}</td>
        <td>{entry.ChangedByName || "Unknown"}</td>
        <td>{entry.ChangeDescription || "No Description"}</td>
        <td>{new Date(entry.CreatedAt).toLocaleDateString()}</td>
        <td>{entry.VersionNumber}</td>
        <td className={styles.actions}>
          <button
            onClick={() => handleView(entry)}
            className={styles.viewBtn}
          >
            View
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr className={styles.noDataRow}>
      <td colSpan={6} style={{ textAlign: "center" }}>
        No history found.
      </td>
    </tr>
  )}
</tbody>

          </table>
       
        {totalPages > 1 && (
  <div className={styles.pagination}>
    <button onClick={handlePrev} disabled={currentPage === 1}>
      Previous
    </button>
    <span>Page {currentPage} of {totalPages}</span>
    <button onClick={handleNext} disabled={currentPage === totalPages}>
      Next
    </button>
  </div>
  
)}
 </div>
      </div>
     {showModal && selectedDoc && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <button className={styles.closeButton} onClick={closeModal}>
              <X size={20} />
            </button>
            <h3 className={styles.modalTitle}>File Versions</h3>

            <div className={styles.modalMeta}>
              <p>
                <strong>File Name:</strong>{" "}
                <span className={styles.highlight}>
                  {selectedDoc.Document.Title}
                </span>
              </p>
              <p>
                <strong>Type:</strong>{" "}
                <span className={styles.highlight}>
                  {selectedDoc.Document.DocumentType.TypeName || "Unknown"}
                </span>
              </p>
              <p>
  <strong>Version:</strong>{" "}
  <select
    className={styles.versionDropdown}
    value={selectedDoc.VersionNumber}
    onChange={(e) => {
      const selectedVersionNumber = Number(e.target.value);
      const versionData = history.find(
        (doc) =>
          doc.Document.Title === selectedDoc.Document.Title &&
          doc.VersionNumber === selectedVersionNumber
      );
      if (versionData) {
        setSelectedDoc(versionData);
      }
    }}
  >
    {history
      .filter((doc) => doc.Document.Title === selectedDoc.Document.Title)
      .sort((a, b) => b.VersionNumber - a.VersionNumber) // optional: newest first
      .map((doc) => (
        <option key={doc.VersionID} value={doc.VersionNumber}>
          {doc.VersionNumber}
        </option>
      ))}
  </select>
</p>

            </div>

            <div className={styles.previewArea}>
              {/* Replace src with your API/preview link */}
              <iframe
                src={`/api/documents/preview/${selectedDoc.VersionID}`}
                width="100%"
                height="500px"
                title="Document Preview"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}