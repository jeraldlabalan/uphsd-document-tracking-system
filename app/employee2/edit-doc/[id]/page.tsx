"use client";
import React, { useState, useEffect } from "react";
import styles from "./editDocStyles.module.css";
import { FileUp, Plus, X } from "lucide-react";
import EmpHeader from "@/components/shared/empHeader";
import Link from "next/link";
import CustomSelect from "@/components/custom-select/CustomSelect";
import Select from "react-select";

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
  const [approverIDs, setApproverIDs] = useState<number[]>(["Select Approver"]); // or []
  const [documentTypes, setDocumentTypes] = useState<
    { TypeID: number; TypeName: string }[]
  >([]);

  const [selectedType, setSelectedType] = useState("Select Document Type");
  const [departments, setDepartments] = useState<
    { DepartmentID: number; Name: string }[]
  >([]);
  const [files, setFiles] = useState([]);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);


  const selectOptions = approvers.map((user) => ({
  value: user.UserID,
  label: `${user.FirstName} ${user.LastName}`,
}));

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
  async function fetchDocumentData() {
    if (!docId) return;

    try {
      const res = await fetch(`/api/employee/my-documents/${docId}`);
      const data = await res.json();

      // populate state with fetched data
      setDocumentName(data.Title);
      setDescription(data.Description);
      setType(data.TypeID);
      setFilePath(data.FilePath || "");
      setDepartmentID(data.DepartmentID);
      setApproverIDs(data.ApproverIDs || []);
      setSelectedType(data.TypeName); // optional
      setDepartment(data.DepartmentName); // optional
    } catch (err) {
      console.error("Failed to fetch document data", err);
    }
  }

  fetchDocumentData();
}, [docId]);
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
    "Information Technology",
    "Business",
    "Human Resource",
  ];
  const documentClassification = [
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

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (newFile) {
      setFiles((prev) => [...prev, { file: newFile, requireEsign: false }]);
    }
  };

  const handleToggleEsign = (index) => {
    const updatedFiles = [...files];
    updatedFiles[index].requireEsign = !updatedFiles[index].requireEsign;
    setFiles(updatedFiles);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
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
          <h2 className={styles.title}>Edit Document</h2>

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
                {/* <select
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
                </select> */}

                <CustomSelect options={documentClassification} value={selectedType} onChange={setSelectedType} />
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
              {/* <select
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
              </select> */}

              <CustomSelect options={departmentOptions} value={department} onChange={setDepartment} />

            </div>

           <div className={styles.sectionHeader}>
  <div className={styles.sectionTitle}>Document Files</div>

  <div className={styles.toggleContainer}>
    <span>Document Required</span>
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={showDocuments}
        onChange={() => setShowDocuments(!showDocuments)}
      />
      <span className={styles.slider}></span>
    </label>
  </div>
</div>


{showDocuments && (
  <>
    {files.map((item, index) => (
      <div key={index} className={styles.inputGroup}>
        <div className={styles.fileItem}>
          <span className={styles.fileName}>{item.file.name}</span>

          <div className={styles.fileActions}>
            <label className={styles.switchContainer}>
              <input
                type="checkbox"
                checked={item.requireEsign}
                onChange={() => handleToggleEsign(index)}
              />
              <span className={styles.switchSlider}></span>
              <span className={styles.switchLabel}>Require E-sign</span>
            </label>

            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => handleRemoveFile(index)}
              aria-label="Remove file"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    ))}

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
          <span>Click or drag to upload</span>
        </div>
      </label>

      {files.length > 0 && (
        <button
          type="button"
          onClick={() =>
            document.querySelector(`.${styles.hiddenInput}`).click()
          }
          className={styles.addFileBtn}
        >
          <Plus size={20} /> Add another file
        </button>
      )}
    </div>
  </>
)}




            {/* Send Document Section */}
<div className={styles.sectionTitle}>Send Document</div>

<div className={styles.approvalContainer}>
  <div className={styles.approvalHeader}>
    <p>
      Select the people who need to review and approve this document in order.
    </p>
    <div className={styles.toggleContainer}>
      <span>Approval Required</span>
      <label className={styles.switch}>
        <input
          type="checkbox"
          checked={approvalRequired}
          onChange={(e) => setApprovalRequired(e.target.checked)}
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  </div>

  {/* ✅ Conditionally show approver rows */}
{approvalRequired &&
  approverIDs.map((id, index) => (
    <div className={styles.approverRow} key={index}>
      <span className={styles.approverNumber}>{index + 1}</span>

      {/* ✅ Searchable Select Dropdown */}
      <Select
  classNamePrefix="select"
  options={selectOptions}
  value={selectOptions.find((opt) => opt.value === id) || null}
  onChange={(selected) => {
    const newIDs = [...approverIDs];
    newIDs[index] = selected?.value || null;
    setApproverIDs(newIDs);
  }}
  placeholder="Select approver..."
  isSearchable
  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
  styles={{
    container: (base) => ({
      ...base,
      width: 'auto',         
      minWidth: '120px',     
      maxWidth: '100%',     
      flex: 1,              
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  }}
/>




      {/* ✅ Add Approver Button */}
      <button
        type="button"
        onClick={addApprover}
        className={styles.addBtn}
      >
        + Add Approver
      </button>

      {/* ✅ Only show Remove if more than 1 approver */}
      {approverIDs.length > 1 && (
        <button
          type="button"
          onClick={() => removeApprover(index)}
          className={styles.removeBtn}
        >
          Remove
        </button>
      )}
    </div>
  ))}




            
              <div className={styles.inputGroup}>
  <label>
    Due Date <span className={styles.optional}>(optional)</span>
  </label>
  <input
    type="date"
    className={styles.inputField}
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    min={new Date().toISOString().split("T")[0]} // 👈 prevents past dates
  />
</div>
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
