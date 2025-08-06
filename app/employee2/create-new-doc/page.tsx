"use client";
import React, { useState, useEffect } from "react";
import styles from "./createNewDocStyles.module.css";
import { FileUp } from "lucide-react";
import EmpHeader from "@/components/shared/empHeader";
import Link from "next/link";

type Approver = {
  UserID: number;
  FirstName: string;
  LastName: string;
};

export default function CreateNewDocument() {
  const [documentName, setDocumentName] = useState("");
  const [classification, setClassification] = useState("Select Document Type");
  const [department, setDepartment] = useState("Select Department");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [readReceipt, setReadReceipt] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(0);
  const [filePath, setFilePath] = useState("");
  const [departmentID, setDepartmentID] = useState<number | null>(null);
  const [approverIDs, setApproverIDs] = useState<number[]>([0]); // or []
  const [documentTypes, setDocumentTypes] = useState<
    { TypeID: number; TypeName: string }[]
  >([]);

  const [selectedType, setSelectedType] = useState("");
  const [departments, setDepartments] = useState<
    { DepartmentID: number; Name: string }[]
  >([]);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/user/department");
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    }

    fetchDepartments();
  }, []);

  useEffect(() => {
    async function fetchDocumentTypes() {
      try {
        const res = await fetch("/api/user/doctype"); // Adjust the endpoint if needed
        if (!res.ok) throw new Error("Failed to fetch document types");
        const data = await res.json();

        if (Array.isArray(data)) {
          setDocumentTypes(data);
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("Error fetching document types:", error);
      }
    }

    fetchDocumentTypes();
  }, []);

  useEffect(() => {
    async function fetchApprovers() {
      try {
        const res = await fetch("/api/employee/create-document/approvers");
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();

        // Validate that data is an array
        if (Array.isArray(data)) {
          setApprovers(data);
        } else {
          console.error("Approvers response is not an array:", data);
          setApprovers([]);
        }
      } catch (error) {
        console.error("Error fetching approvers:", error);
        setApprovers([]); // Fallback to empty list to prevent crash
      }
    }

    fetchApprovers();
  }, []);

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

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const payload = {
      Title: title,
      Description: description,
      TypeID: type,
      FilePath: filePath,
      DepartmentID: departmentID,
      ApproverIDs: approverIDs,
    };

    const res = await fetch("/api/employee/create-document", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Document created successfully!");
    } else {
      alert(data.error || "Failed to create document");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addApprover = () => {
    setApproverIDs([...approverIDs, 0]); // 0 means no selection yet
  };

  const removeApprover = (index: number) => {
    const updated = [...approverIDs];
    updated.splice(index, 1);
    setApproverIDs(updated);
  };

  const handleClear = () => {
    setDocumentName("");
    setClassification("Select Document Type");
    setDescription("");
    setDepartment("Select Department");
    setSelectedFile(null);
    setApprovers([]);
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
          <form onSubmit={handleSubmit} className={styles.form}>
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
                  id="documentType"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  required
                >
                  <option value="">Select a type</option>
                  {documentTypes.map((type) => (
                    <option key={type.TypeID} value={type.TypeID}>
                      {type.TypeName}
                    </option>
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
                value={departmentID ?? ""}
                onChange={(e) => {
                  const selectedID = Number(e.target.value);
                  setDepartmentID(isNaN(selectedID) ? null : selectedID);
                }}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dep) => (
                  <option key={dep.DepartmentID} value={dep.DepartmentID}>
                    {dep.Name}
                  </option>
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
                    {selectedFile
                      ? selectedFile.name
                      : "Click or drag to upload"}
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

              {approverIDs.map((id, index) => (
                <div className={styles.approverRow} key={index}>
                  <span className={styles.approverNumber}>{index + 1}</span>
                  <select
                    className={styles.selectField}
                    value={id}
                    onChange={(e) => {
                      const newIDs = [...approverIDs];
                      newIDs[index] = Number(e.target.value);
                      setApproverIDs(newIDs);
                    }}
                  >
                    <option value="">Select an approver</option>
                    {approvers.map((user) => (
                      <option key={user.UserID} value={user.UserID}>
                        {user.FirstName} {user.LastName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addApprover}
                    className={styles.addBtn}
                  >
                    + Add Approver
                  </button>

                  <button type="button" onClick={() => removeApprover(index)}>
                    Remove
                  </button>
                </div>
              ))}
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
                <button className={styles.submitBtn} type="submit">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
