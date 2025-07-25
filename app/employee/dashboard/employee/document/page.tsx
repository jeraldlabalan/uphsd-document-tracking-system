"use client";

import Head from "next/head";
import styles from "./document.module.css";
import { useState, useEffect } from "react";
import EmployeeSidebar from "@/components/shared/employeeSidebar/employeeSidebar";
import EmployeeHeader from "@/components/shared/employeeHeader/employeeHeader";
import Modal from "@/components/shared/modalHistory/modal";

interface DocumentType {
  id: number; // DocumentRequest.RequestID
  title: string; // Document.Title
  fileType: string; // Document.Type or file extension
  status: string; // Status.StatusName
  date: string; // RequestedAt or CreatedAt
}

const documents = [
  {
    title: "IT Equipment Purchase Request",
    fileType: "PDF File",
    status: "Pending",
    date: "July 5, 2025",
  },
  {
    title: "Student Grades",
    fileType: "PDF File",
    status: "Completed",
    date: "July 5, 2025",
  },
  {
    title: "Student Good Moral Request",
    fileType: "PDF File",
    status: "Pending",
    date: "July 5, 2025",
  },
];

export default function Document() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    inProcess: 0,
    completed: 0,
  });

  useEffect(() => {
    const fetchDocs = async () => {
      const res = await fetch("/api/employee/documents");
      const data = await res.json();
      setDocuments(data.docs);
      setSummary(data.summary);
    };

    fetchDocs();
  }, []);

  const handleDelete = async (id: number) => {
    await fetch(`/api/documents/${id}/delete`, { method: "DELETE" });
    setDocuments((docs) => docs.filter((doc) => doc.id !== id));
  };

  return (
    <>
      <div className={styles.Maincontainer}>
        <Head>
          <title className={styles.title}>Document</title>
        </Head>

        <EmployeeHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className={styles.container}>
          <EmployeeSidebar sidebarOpen={sidebarOpen} />

          <main className={styles.main}>
            <div className={styles.Maincontainer}>
              <div className={styles.headerRow}>
                <h1 className={styles.heading}>My Documents</h1>
                <a
                  className={styles.createButton}
                  href="/employee/create-new-doc"
                >
                  <span>+</span> Create New Document
                </a>
              </div>

              <div className={styles.cards}>
                <div className={`${styles.card} ${styles.red}`}>
                  <span className={styles.count}>{summary.total}</span>
                  <p>Total Documents</p>
                </div>
                <div className={`${styles.card} ${styles.blue}`}>
                  <span className={styles.count}>{summary.inProcess}</span>
                  <p>In Process</p>
                </div>
                <div className={`${styles.card} ${styles.green}`}>
                  <span className={styles.count}>{summary.completed}</span>
                  <p>Completed</p>
                </div>
              </div>

              {/* search */}
              <div className={styles.searchAndFilter}>
                <input
                  type="text"
                  placeholder="Search documents..."
                  className={styles.searchInput}
                />

                <select className={styles.dropdown}>
                  <option value="all">All Status</option>
                  <option value="in-process">In Process</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select className={styles.dropdown}>
                  <option value="all">All Types</option>
                  <option value="Memo">Memo</option>
                  <option value="report">Report</option>
                  <option value="request">Request</option>
                  <option value="evaluation">Evaluation</option>
                </select>
              </div>

              {/* table */}
              <div className={styles.containerTable}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.tableHeader}>
                      <th>Document</th>
                      <th>File</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.title}</td>
                        <td>{doc.fileType}</td>
                        <td>
                          <span
                            className={
                              doc.status === "Completed"
                                ? styles.statusCompleted
                                : styles.statusPending
                            }
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td>{doc.date}</td>
                        <td>
                          <a
                            href="#"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setIsViewModalOpen(true);
                            }}
                          >
                            View
                          </a>{" "}
                          | <a href="#">Edit</a> |{" "}
                          <a href="#" onClick={() => handleDelete(doc.id)}>
                            Delete
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isViewModalOpen && selectedDoc && (
              <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
              >
                <h2>Document Details</h2>
                <p>
                  <strong>Title:</strong> {selectedDoc.title}
                </p>
                <p>
                  <strong>Type:</strong> {selectedDoc.fileType}
                </p>
                <p>
                  <strong>Status:</strong> {selectedDoc.status}
                </p>
                <p>
                  <strong>Date:</strong> {selectedDoc.date}
                </p>
              </Modal>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
