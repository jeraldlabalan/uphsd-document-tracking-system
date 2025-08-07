"use client";

import { useState, useEffect } from "react";
import styles from "./documentOverview.module.css";
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


export default function DocumentOverview() {

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


const documents = [
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
    !search || doc.name?.toLowerCase().includes(search.toLowerCase());

  const docDate = new Date(doc.dateCreated);
  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(dateTo) : null;

  const dateMatch =
    (!fromDate || docDate >= fromDate) &&
    (!toDate || docDate <= toDate);

  return statusMatch && typeMatch && searchMatch && dateMatch;
});


const handleDownload = () => {
  if (!selectedDoc?.file) return;
  const link = document.createElement("a");
  link.href = `/path/to/files/${selectedDoc.file}`; // Adjust file path accordingly
  link.download = selectedDoc.file;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handlePrint = () => {
  window.print();
};

const handleCloseModal = () => {
  setIsModalOpen(false);
};

const handleConfirmDelete = () => {
  // Your logic to delete the user/document goes here
  setIsModalOpen(false);
  setShowSuccessModal(true);
};

const handleCloseSuccess = () => {
  setShowSuccessModal(false);
};


  return (
    <div>
      <AdminHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Document Overview</h2>
          
            
          </div>
          <hr className={styles.separator} />

          <div className={styles.summary}>
  
            <div className={`${styles.card} ${styles.green}`}>
              <CheckCircle className={styles.icon} />
              <span className={styles.count}>116</span>
              <span>Complete</span>
            </div>

            <div className={`${styles.card} ${styles.cyan}`}>
              <Clock className={styles.icon} />
              <span className={styles.count}>3</span>
              <span>In Process</span>
            </div>

            <div className={`${styles.card} ${styles.orange}`}>
              <Clock className={styles.icon} />
              <span className={styles.count}>5</span>
              <span>Pending Approvals</span>
            </div>

            <div className={`${styles.card} ${styles.red}`}>
              <PauseCircle className={styles.icon} />
              <span className={styles.count}>5</span>
              <span>On Hold</span>
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
      <th>Creator</th>
      <th>Department</th>
      <th>Status</th>
      <th>Date Created</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
   {filteredDocs.map((doc, i) => (
      <tr key={i}>
        <td>{doc.id}</td>
        <td>{doc.name}</td>
        <td>{doc.department}</td>
        <td>
          <span
  className={`${styles.badge} ${
    doc.status === "Completed"
      ? styles.completed
      : doc.status === "In Process"
      ? styles.inProcess
      : doc.status === "On Hold"
      ? styles.onHold
      : styles.pending
  }`}
>
  {doc.status}
</span>

        </td>
        <td>{doc.dateCreated}</td>
        <td>
          <a href="#" onClick={() => setSelectedDoc(doc)}
            className={`${styles.actionBtn} ${styles.viewBtn}`}>
            View
          </a> 
          {" "}
         
          <button
  className={`${styles.actionBtn} ${styles.deleteBtn}`}
  onClick={() => {
    setSelectedUser(doc);
    setIsModalOpen(true);
  }}
>
  Delete
</button>

        </td>
      </tr>
    ))}
  </tbody>
</table>

        </div>

       {selectedDoc && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalCard}>
      <button
        className={styles.closeButton}
        onClick={() => setSelectedDoc(null)}
        aria-label="Close Modal"
      >
        <X size={20} />
      </button>

      <div className={styles.modalTop}>
        <h3 className={styles.modalTitle}>{selectedDoc.name}</h3>
        <span className={`${styles.badge} ${selectedDoc.status === "Completed" ? styles.completed : styles.pending}`}>
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

      <div className={styles.previewContainer}>
        {selectedDoc.preview?.match(/\.pdf$/i) ? (
          <iframe
            src={`${selectedDoc.preview}#toolbar=0&navpanes=0&scrollbar=0`}
            title="PDF Preview"
            width="100%"
            height="600px"
            style={{ border: "none" }}
          ></iframe>
        ) : selectedDoc.preview ? (
          <a href={selectedDoc.preview} target="_blank" rel="noopener noreferrer">
            Download File
          </a>
        ) : (
          <p>No preview available.</p>
        )}
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.download} onClick={handleDownload}>
          Download
        </button>
        <button className={styles.print} onClick={handlePrint}>
          Print
        </button>
      </div>
    </div>
  </div>
)}

             {/* Modal */}
      {isModalOpen && (
        <div className={styles.deletemodalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.deletemodalTitle}>Confirm Deletion</h3>
            <p>Are you sure you want to delete this document? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button onClick={handleCloseModal} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className={styles.confirmButton}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.successmodalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.successmodalTitle}>Success!</h3>
            <p>Document has been  successfully deleted.</p>
            <div className={styles.modalActions}>
              <button onClick={handleCloseSuccess} className={styles.closeButtonx}>
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
