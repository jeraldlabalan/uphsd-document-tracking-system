"use client";

import Head from 'next/head';
import styles from './history.module.css';
import { useState } from 'react';
import EmployeeSidebar from "@/components/shared/employeeSidebar/employeeSidebar";
import EmployeeHeader from "@/components/shared/employeeHeader/employeeHeader";
import Modal from "@/components/shared/modalHistory/modal";

interface DocumentType {
  title: string;
  Aprrove: string;
  status: 'Pending' | 'Completed' | string;
  created: string;
  Completed: string;
}

const initialDocuments: DocumentType[] = [
  {
    title: 'IT Equipment Purchase Request',
    Aprrove: 'SD',
    status: 'Pending',
    created: 'July 5, 2025',
    Completed: 'July 5, 2025',
  },
  {
    title: 'Student Grades',
    Aprrove: 'Antonio Orcales',
    status: 'Completed',
    created: 'July 5, 2025',
    Completed: 'July 10, 2025',
  },
  {
    title: 'Student Good Moral Request',
    Aprrove: 'Antonio Orcales',
    status: 'Pending',
    created: 'July 5, 2025',
    Completed: 'July 10, 2025',
  },
  {
    title: 'Request Form',
    Aprrove: 'Antonio Orcales',
    status: 'Pending',
    created: 'July 5, 2025',
    Completed: 'July 10, 2025',
  },
];

export default function History() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [documents, setDocuments] = useState<DocumentType[]>(initialDocuments);
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const handleView = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setIsViewModalOpen(true);
  };

  const handleDelete = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDoc) {
      setDocuments((docs) => docs.filter((doc) => doc !== selectedDoc));
      setSelectedDoc(null);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className={styles.Maincontainer}>
        <Head>
          <title>Document</title>
        </Head>

        <EmployeeHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className={styles.container}>
          <EmployeeSidebar sidebarOpen={sidebarOpen} />

          <main className={styles.main}>
            <div className={styles.Maincontainer}>
              <div className={styles.headerRow}>
                <h1 className={styles.heading}>History</h1>
              </div>

              {/* Search */}
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

              {/* Table */}
              <div className={styles.MainTable}>
                <div className={styles.containerTable}>
                  <table className={styles.table}>
                    <thead>
                      <tr className={styles.tableHeader}>
                        <th>Document</th>
                        <th>Approved by</th>
                        <th>Department</th>
                        <th>Created</th>
                        <th>Completed</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc, index) => (
                        <tr key={index}>
                          <td>{doc.title}</td>
                          <td>{doc.Aprrove}</td>
                          <td>
                            <span
                              className={
                                doc.status === 'Completed'
                                  ? styles.statusCompleted
                                  : styles.statusPending
                              }
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td>{doc.created}</td>
                          <td>{doc.Completed}</td>
                          <td>
                            <a href="#" onClick={() => handleView(doc)}>View</a> |{" "}
                            <a href="#" onClick={() => handleDelete(doc)}>Delete</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
              <h2>Document Details</h2>
              {selectedDoc && (
                <div>
                  <p><strong>Title:</strong> {selectedDoc.title}</p>
                  <p><strong>Approved By:</strong> {selectedDoc.Aprrove}</p>
                  <p><strong>Status:</strong> {selectedDoc.status}</p>
                  <p><strong>Created:</strong> {selectedDoc.created}</p>
                  <p><strong>Completed:</strong> {selectedDoc.Completed}</p>
                </div>
              )}
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
              <h2 className={styles.Confirm}>Confirm Deletion</h2>
              {selectedDoc && (
                <p>Are you sure you want to delete <strong>{selectedDoc.title}</strong>?</p>
              )}
              <button onClick={confirmDelete} className={styles.DeleteButton}>Delete</button>
            </Modal>
          </main>
        </div>
      </div>
    </>
  );
}
