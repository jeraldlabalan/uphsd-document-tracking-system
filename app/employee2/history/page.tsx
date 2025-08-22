"use client";

import { useState, useEffect } from "react";
import styles from "./historyStyles.module.css"; // Reuse same styles
import EmpHeader from "@/components/shared/empHeader";
import { Search as SearchIcon, X, FileText, Download } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { fetchFilterData, FilterData } from "@/lib/filterData";
import Loading from "@/app/loading";

// Set up PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  FilePath: string;
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
  const [currentVersion, setCurrentVersion] = useState<DocumentVersionHistory | null>(null);


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
  const fetchAllData = async () => {
    try {
      setLoading(true); // ✅ start loader

      // Fetch history
      const resHistory = await fetch("/api/employee/history");
      let historyData: any[] = [];
      if (resHistory.ok) {
        const dataHistory = await resHistory.json();
        console.log("Fetched history data:", dataHistory);
        historyData = dataHistory || [];
      } else {
        console.error("Failed to fetch history");
      }
      setHistory(historyData);

      // Fetch filter data
      const filterData = await fetchFilterData();
      setFilterData(filterData);

    } catch (err) {
      console.error("Error fetching data:", err);
      setHistory([]);
      setFilterData({
        documentTypes: [],
        departments: [],
        statuses: []
      });
    } finally {
      setLoading(false); // ✅ stop loader after both fetches
    }
  };

  fetchAllData();
}, []);

const handleDownload = () => {
  if (!currentVersion?.FilePath) return;
  const url = getFileUrl(currentVersion.FilePath);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${selectedDoc?.Document.Title || "document"}_v${currentVersion.VersionNumber}`;
  link.click();
};

const handlePrint = () => {
  if (!currentVersion?.FilePath) return;
  const url = getFileUrl(currentVersion.FilePath);
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.addEventListener("load", () => {
      printWindow.focus();
      printWindow.print();
    });
  }
};


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
    console.log('Opening document:', entry.Document.Title, 'File path:', entry.FilePath);
    console.log('Full file URL:', getFileUrl(entry.FilePath));
    
    setSelectedDoc(entry);
    setCurrentVersion(entry);
    setShowModal(true);

  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
    setCurrentVersion(null);

  };

  const handleVersionChange = (versionNumber: number) => {
    console.log('Changing to version:', versionNumber);
    // Find the document version with the selected version number
    const versionData = history.find(
      (doc) =>
        doc.Document.Title === selectedDoc?.Document.Title &&
        doc.VersionNumber === versionNumber
    );
    
    if (versionData) {
      console.log('New version data:', versionData);
      setCurrentVersion(versionData);
    }
  };

  // Get available versions for the selected document
  const getAvailableVersions = () => {
    if (!selectedDoc) return [];
    
    return history
      .filter((doc) => doc.Document.Title === selectedDoc.Document.Title)
      .sort((a, b) => b.VersionNumber - a.VersionNumber); // Newest first
  };

  // Get file extension from file path
  const getFileExtension = (filePath: string) => {
    if (!filePath) return '';
    const parts = filePath.split('.');
    return parts[parts.length - 1]?.toLowerCase() || '';
  };

  // Check if file is viewable in browser
  const isViewableFile = (filePath: string) => {
    const extension = getFileExtension(filePath);
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'].includes(extension);
  };

  // Construct full file URL from database file path
  const getFileUrl = (filePath: string) => {
    if (!filePath) return '';
    
    let baseUrl = '';
    
    // If it's already a full URL, use as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      baseUrl = filePath;
    } else if (filePath.startsWith('/')) {
      // If it's a relative path starting with /, construct full URL
      baseUrl = `${window.location.origin}${filePath}`;
    } else {
      // If it's a relative path without leading slash, add it
      baseUrl = `${window.location.origin}/${filePath}`;
    }
    
    // Add PDF parameters to hide thumbnail sidebar and other controls
    const extension = getFileExtension(filePath);
    if (extension === 'pdf') {
      return `${baseUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
    }
    
    return baseUrl;
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



if (loading) {
    return <Loading />;
  }

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
     {showModal && selectedDoc && currentVersion && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalCard} data-aos="zoom-in">
      <button className={styles.closeButton} onClick={closeModal}>
        <X size={20} />
      </button>

      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>File Versions</h3>

        <div className={styles.modalBody}>
          {/* Left Column: Metadata */}
          <div className={styles.metaColumn}>
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
                value={currentVersion.VersionNumber}
                onChange={(e) =>
                  handleVersionChange(Number(e.target.value))
                }
              >
                {getAvailableVersions().map((doc) => (
                  <option key={doc.VersionID} value={doc.VersionNumber}>
                    Version {doc.VersionNumber} -{" "}
                    {new Date(doc.CreatedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </p>
            <p>
              <strong>Changed By:</strong>{" "}
              <span className={styles.highlight}>
                {currentVersion.ChangedByName}
              </span>
            </p>
            <p>
              <strong>Description:</strong>{" "}
              <span className={styles.highlight}>
                {currentVersion.ChangeDescription}
              </span>
            </p>
            <p>
              <strong>Created:</strong>{" "}
              <span className={styles.highlight}>
                {new Date(currentVersion.CreatedAt).toLocaleDateString()}
              </span>
            </p>
         
          </div>

          {/* Right Column: Preview */}
          <div className={styles.previewColumn}>
            {currentVersion.FilePath ? (
              isViewableFile(currentVersion.FilePath) ? (
                <div className={styles.pdfViewerContainer}>
                  <iframe
                    src={getFileUrl(currentVersion.FilePath)}
                    title={`Document Preview - Version ${currentVersion.VersionNumber}`}
                  />
                </div>
              ) : (
                <div className={styles.fileError}>
                  <FileText size={48} color="#666" />
                  <h4>File Preview Not Available</h4>
                  <p>
                    This file type (
                    {getFileExtension(currentVersion.FilePath)}) cannot be
                    previewed in the browser.
                  </p>
                  <a
                    href={getFileUrl(currentVersion.FilePath)}
                    download
                    className={styles.downloadBtn}
                  >
                    <Download size={16} /> Download File
                  </a>
                </div>
              )
            ) : (
              <div className={styles.fileError}>
                <FileText size={64} color="#ccc" />
                <h4>No File Path Available</h4>
                <p>This document version doesn't have an associated file.</p>
              </div>
            )}
          </div>
        </div>
      </div>
        <div className={styles.modalFooter}>
  <button className={styles.downloadBtn} onClick={handleDownload}>
    Download
  </button>
  <button className={styles.downloadBtn} onClick={handlePrint}>
    Print
  </button>
</div>
    </div>
  </div>
)}

    </div>
  );
}