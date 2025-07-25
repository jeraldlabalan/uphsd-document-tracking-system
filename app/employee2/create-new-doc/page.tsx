"use client";
import React, { useState } from "react";
import styles from "./createNewDocStyles.module.css";
import { FileUp } from "lucide-react";
import EmpHeader from "@/components/shared/empHeader";
import Link from "next/link";

export default function CreateNewDocument() {
  const [documentName, setDocumentName] = useState("");
  const [classification, setClassification] = useState("Select Document Type");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Select Department");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [approvers, setApprovers] = useState([{ id: Date.now() }]);
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [readReceipt, setReadReceipt] = useState(false);

  const departmentOptions = [
    "Select Department",
    "Information Technology",
    "Business",
    "Human Resource",
  ];
  const documentClassification = [
    "Select Document Type",
    "Memo",
    "Report",
    "Notice",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addApprover = () => {
    setApprovers((prev) => [...prev, { id: Date.now() }]);
  };

  const removeApprover = (id: number) => {
    setApprovers((prev) => prev.filter((approver) => approver.id !== id));
  };

  const handleClear = () => {
    setDocumentName("");
    setClassification("Select Document Type");
    setDescription("");
    setDepartment("Select Department");
    setSelectedFile(null);
    setApprovers([{ id: Date.now() }]);
    setDate("");
    setDueDate("");
    setNotes("");
    setSendEmail(false);
    setReadReceipt(false);
  };

  return (
    <div className={styles.container}>
      <EmpHeader />
      <div className={styles.contentContainer}>
        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Create New Document</h2>

          <div className={styles.sectionTitle}>Information</div>

          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <label>Document Name</label>
              <input
                type="text"
                placeholder="Enter document name"
                className={styles.inputField}
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Document Classification</label>
              <select
                className={styles.selectField}
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
              >
                {documentClassification.map((type, idx) => (
                  <option key={idx}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea
              placeholder="Description of the document"
              className={styles.textareaField}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Department</label>
            <select
              className={styles.selectField}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {departmentOptions.map((dep, idx) => (
                <option key={idx}>{dep}</option>
              ))}
            </select>
          </div>

          <div className={styles.sectionTitle}>Document Files</div>

          <div className={styles.inputGroup}>
            <label>Upload Documents</label>
            <label className={styles.uploadBox}>
              <input
                type="file"
                onChange={handleFileChange}
                className={styles.hiddenInput}
              />
              <div className={styles.uploadContent}>
                <FileUp size={32} />
                <span>
                  {selectedFile ? selectedFile.name : "Click or drag to upload"}
                </span>
              </div>
            </label>
          </div>

          {/* Send Document Section */}
          <div className={styles.sectionTitle}>Send Document</div>

          <div className={styles.approvalContainer}>
            <div className={styles.approvalHeader}>
              <p>
                Select the people who need to review and approve this document
                in order.
              </p>
              <div className={styles.toggleContainer}>
                <span>Approval Required</span>
                <label className={styles.switch}>
                  <input type="checkbox" />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>

            {approvers.map((approver, index) => (
              <div className={styles.approverRow} key={approver.id}>
                <span className={styles.approverNumber}>{index + 1}</span>
                <select className={styles.selectField}>
                  <option>{`Select approver`}</option>
                </select>
                {approvers.length > 1 && (
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeApprover(approver.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button className={styles.addBtn} onClick={addApprover}>
              + Add New Approver
            </button>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <label>Date</label>
              <input
                type="date"
                className={styles.inputField}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>
                Due Date <span className={styles.optional}>(optional)</span>
              </label>
              <input
                type="date"
                className={styles.inputField}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Additional Notes</label>
            <textarea
              className={styles.textareaField}
              placeholder="Any additional instruction or note for approver"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
              Send email notifications to approver
            </label>
            <label>
              <input
                type="checkbox"
                checked={readReceipt}
                onChange={(e) => setReadReceipt(e.target.checked)}
              />
              Request read receipts
            </label>
          </div>

          <div className={styles.buttonGroup}>
            <div className={styles.leftButtons}>
              <Link href="./my-documents">
                <button className={styles.backBtn}>Back</button>{" "}
              </Link>
            </div>
            <div className={styles.rightButtons}>
              <button className={styles.clearBtn} onClick={handleClear}>
                Clear
              </button>
              <button className={styles.submitBtn}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
