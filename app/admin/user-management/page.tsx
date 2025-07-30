"use client";

import { useState, useEffect } from "react";
import styles from "./userManagement.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import { Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import { X } from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { Users, UserX, Clock, UserPlus, Activity } from "lucide-react";


// const cookieStore = await cookies();
  // const session = cookieStore.get("session");

  // console.log("SESSION:", session); // ✅ prints to server logs

  // if (!session) {
  //   redirect("/login"); // or wherever you want
  // }


export default function UserManagement() {

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showTerminateSuccess, setShowTerminateSuccess] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false); // optional
  const [showEditSuccess, setShowEditSuccess] = useState(false); // optional

  const users = [
  {
    id: "U-001",
    name: "Kai Sotto",
    department: "IT Department",
    position: "Software Engineer",
    status: "Active",
    dateCreated: "July 1, 2025",
  },
  {
    id: "U-002",
    name: "Kobe Bryant",
    department: "HR Department",
    position: "HR Manager",
    status: "Terminated",
    dateCreated: "July 2, 2025",
  },
  {
    id: "U-003",
    name: "Kyrie Irving",
    department: "Finance",
    position: "Accountant",
    status: "Pending",
    dateCreated: "July 3, 2025",
  },
];

  const handleDownload = () => {
    if (selectedDoc?.preview) {
      const link = document.createElement('a');
      link.href = selectedDoc.preview;
      link.download = selectedDoc.name || 'document'; 
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (selectedDoc?.preview) {
      const printWindow = window.open(selectedDoc.preview, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

const filteredUsers = users.filter((user) => {
  const statusMatch = !statusFilter || user.status === statusFilter;
  const searchMatch =
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.id.toLowerCase().includes(search.toLowerCase()) ||
    user.department.toLowerCase().includes(search.toLowerCase()) ||
    user.position.toLowerCase().includes(search.toLowerCase());

  const userDate = new Date(user.dateCreated);
  const from = dateFrom ? new Date(dateFrom) : null;
  const to = dateTo ? new Date(dateTo) : null;

  const dateMatch =
    (!from || userDate >= from) &&
    (!to || userDate <= to);

  return statusMatch && searchMatch && dateMatch;
});


  return (
    <div>
      <AdminHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>User Management</h2>
            <Link href="./user-management/create-new-user">
                          <button className={styles.createButton}>
                            + Create New User
                          </button>
                        </Link>
            
          </div>
          <hr className={styles.separator} />

          <div className={styles.summary}>
  <div className={`${styles.card} ${styles.orange}`}>
    <Users className={styles.icon} />
    <span className={styles.count}>500</span>
    <span>Total Users</span>
  </div>
  <div className={`${styles.card} ${styles.cyan}`}>
    <Activity className={styles.icon} />
    <span className={styles.count}>3</span>
    <span>Active User</span>
  </div>
  <div className={`${styles.card} ${styles.green}`}>
    <Clock className={styles.icon} />
    <span className={styles.count}>5</span>
    <span>Pending Approvals</span>
  </div>
  <div className={`${styles.card} ${styles.yellow}`}>
    <UserX className={styles.icon} />
    <span className={styles.count}>5</span>
    <span>Terminated</span>
  </div>
  <div className={`${styles.card} ${styles.purple}`}>
    <UserPlus className={styles.icon} />
    <span className={styles.count}>5</span>
    <span>New Account</span>
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
      onChange={(e) => setDateFrom(e.target.value)}
      className={styles.dateInput}
    />
  </div>

  <div className={styles.dateGroup}>
    <span className={styles.dateLabel}>To:</span>
    <input
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      className={styles.dateInput}
    />
  </div>
</div>


          </div>
          <table className={styles.docTable}>
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Department</th>
      <th>Position</th>
      <th>Status</th>
      <th>Date Created</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
   {filteredUsers.map((user, i) => (
      <tr key={i}>
        <td>{user.id}</td>
        <td>{user.name}</td>
        <td>{user.department}</td>
        <td>{user.position}</td>
        <td>
          <span
            className={`${styles.badge} ${
              user.status === "Active"
                ? styles.active
                : user.status === "Terminated"
                ? styles.terminated
                : styles.pending
            }`}
          >
            {user.status}
          </span>
        </td>
        <td>{user.dateCreated}</td>
        <td>
          <Link href="/admin/user-management/edit-user">
          <a className={styles.actionBtn}>Edit</a> {" "}
          </Link>
         
          <button
          className={styles.actionBtn}
          onClick={() => {
            setSelectedUser(user.name);
            setShowTerminateConfirm(true);
          }}
        >
          Terminate
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

              {/* Header Row */}
              <div className={styles.modalTop}>
                <h3 className={styles.modalTitle}>{selectedDoc.name}</h3>
                <span
                  className={`${styles.badge} ${
                    selectedDoc.status === "Completed"
                      ? styles.completed
                      : styles.pending
                  }`}
                >
                  {selectedDoc.status}
                </span>
              </div>

              {/* Metadata Row */}
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

              {/* Document Preview */}
              <div className={styles.previewContainer}>
  {selectedDoc.preview?.match(/\.pdf$/i) ? (
    <iframe
      src={`${selectedDoc.preview}#toolbar=0&navpanes=0&scrollbar=0`}
      title="PDF Preview"
      width="100%"
      height="600px"
      style={{ border: 'none' }}
    ></iframe>
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


              {/* Footer Buttons */}
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

            {/* MODALS FOR REACTIVATION AND TERMINATE ACTIONS */}
          {showEditConfirm && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h3 className={styles.editmodalTitle}>Confirm Reactivation</h3>
      <p>Are you sure you want to reactivate this account?</p>
      <div className={styles.modalActions}>
        <button
          className={styles.reactivatecancelButton}
          onClick={() => {
            setShowEditConfirm(false);
            setSelectedUser(null);
          }}
        >
          Cancel
        </button>
        <button
          className={styles.confirmButton}
          onClick={() => {
            setShowEditConfirm(false);
            setShowEditSuccess(true);
          }}
        >
          Continue
        </button>
      </div>
    </div>
  </div>
)}

{showEditSuccess && (
  <div className={styles.successmodalOverlay}>
    <div className={styles.modal}>
      <h3 className={styles.successmodalTitle}>Success!</h3>
      <p>{selectedUser} has been successfully edited.</p>
      <div className={styles.modalActions}>
        <button
          onClick={() => {
            setShowEditSuccess(false);
            setSelectedUser(null);
          }}
          className={styles.closeButtonx}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}



{showTerminateConfirm && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h3 className={styles.terminatemodalTitle}>Confirm Termination</h3>
      <p>Are you sure you want to terminate this account?</p>
      <div className={styles.modalActions}>
        <button
          className={styles.terminatecancelButton}
          onClick={() => {
            setShowTerminateConfirm(false);
            setSelectedUser(null);
          }}
        >
          Cancel
        </button>
        <button
          className={styles.terminateButton}
          onClick={() => {
            setShowTerminateConfirm(false);
            setShowTerminateSuccess(true);
          }}
        >
          Continue
        </button>
      </div>
    </div>
  </div>
)}

{showTerminateSuccess && (
  <div className={styles.successmodalOverlay}>
    <div className={styles.modal}>
      <h3 className={styles.successmodalTitle}>Terminated</h3>
      <p>{selectedUser} has been successfully terminated.</p>
      <div className={styles.modalActions}>
        <button
          onClick={() => {
            setShowTerminateSuccess(false);
            setSelectedUser(null);
          }}
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
