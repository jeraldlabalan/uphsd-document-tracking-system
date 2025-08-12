"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./createNewDocStyles.module.css";
import { FileUp, Plus, X } from "lucide-react";
import EmpHeader from "@/components/shared/empHeader";
import Link from "next/link";
import Select, { SingleValue } from "react-select";
import { useRouter } from "next/navigation"; // ✅ Correct import for App Router


type Approver = {
  UserID: number;
  FirstName: string;
  LastName: string;
};

export default function CreateNewDocument() {
  const [openSelect1, setOpenSelect1] = useState(false); // Document Classification
  const [openSelect2, setOpenSelect2] = useState(false); // Department
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>(
    "Select Document Type"
  );

  const [selectedTypeID, setSelectedTypeID] = useState<number | null>(null);

  const [department, setDepartment] = useState<string>("Select Department");

  const [documentTypes, setDocumentTypes] = useState<
    { TypeID: number; TypeName: string }[]
  >([]);

  const [departments, setDepartments] = useState<
    { DepartmentID: number; Name: string }[]
  >([]);

  const [departmentID, setDepartmentID] = useState<number | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  const toggleSelectOpen1 = () => setOpenSelect1((prev) => !prev);
  const toggleSelectOpen2 = () => setOpenSelect2((prev) => !prev);

  // Handle department select
  const handleDepartmentSelect = (name: string, id: number) => {
    console.log("Selected Department:", name, "ID:", id); // Log selected department
    setDepartment(name); // Update department value
    setDepartmentID(id); // Update department ID
  };

  useEffect(() => {
    console.log("Open Select2 Status:", openSelect2); // Log current state of the dropdown
  }, [openSelect2]); // This will log whenever the dropdown state changes

  const handleDocumentSelect = (name: string, id: number) => {
    console.log(name);
    console.log(id);
    setSelectedType(name);
    setSelectedTypeID(id);
    setOpenSelect1(false); // Close dropdown after selection
  };

  useEffect(() => {
    console.log("Current selected department:", department); // Log the department when it changes
  }, [department]);

  const [classification, setClassification] = useState<string>(
    "Select Document Type"
  );
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
  const [approverIDs, setApproverIDs] = useState<number[]>([]); // or []
  const [files, setFiles] = useState<{ file: File; requireEsign: boolean }[]>(
    []
  );
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  // Add loading, error, and success states for form submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        setDepartments(data); // Set department list
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    }
    fetchDepartments();
  }, []);

  useEffect(() => {
    async function fetchDocumentTypes() {
      try {
        const res = await fetch("/api/user/doctype");
        if (!res.ok) throw new Error("Failed to fetch document types");
        const data = await res.json();
        setDocumentTypes(data);
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

        if (Array.isArray(data)) {
          const approversWithCorrectType: Approver[] = data.map((approver) => ({
            UserID: approver.UserID,
            FirstName: approver.FirstName,
            LastName: approver.LastName,
          }));

          setApprovers(approversWithCorrectType);
        } else {
          console.error("Approvers response is not an array:", data);
          setApprovers([]); // Default to empty list
        }
      } catch (error) {
        console.error("Error fetching approvers:", error);
        setApprovers([]);
      }
    }

    fetchApprovers();
  }, []);

  // Check for e-signed documents when page loads
  useEffect(() => {
    const eSignedUrl = localStorage.getItem("eSignedDocumentUrl");
    const eSignedTitle = localStorage.getItem("eSignedDocumentTitle");

    if (eSignedUrl && eSignedTitle) {
      // Show success message
      alert(`E-signed document "${eSignedTitle}" has been saved successfully!`);

      // Clear localStorage
      localStorage.removeItem("eSignedDocumentUrl");
      localStorage.removeItem("eSignedTitle");

      // In a real implementation, you would:
      // 1. Update the form to show the e-signed document
      // 2. Replace the original file with the e-signed version
      // 3. Update the file list to reflect the changes
    }
  }, []);

  // Check for documents with placeholders when page loads
  useEffect(() => {
    const savedDocumentUrl = localStorage.getItem(
      "documentWithPlaceholdersUrl"
    );
    const savedDocumentTitle = localStorage.getItem(
      "documentWithPlaceholdersTitle"
    );

    if (savedDocumentUrl && savedDocumentTitle) {
      // Clear the localStorage
      localStorage.removeItem("documentWithPlaceholdersUrl");
      localStorage.removeItem("documentWithPlaceholdersTitle");

      // Set the saved document state to display in UI
      setSavedDocument({
        title: savedDocumentTitle,
        url: savedDocumentUrl,
        status: "Awaiting Signatures",
      });

      // Show success message with more details
      alert(
        `Document "${savedDocumentTitle}" has been saved with signature placeholders!\n\nWhat happens next:\n1. The document is now ready for signees to review\n2. Signees will be notified automatically\n3. They can access the document through their dashboard\n4. Once all signatures are complete, the document will be fully processed`
      );
    }
  }, []);

  // State for saved document display
  const [savedDocument, setSavedDocument] = useState<{
    title: string;
    url: string;
    status: string;
  } | null>(null);

  // Handle Approver Change (example of setting approver IDs)
  const handleApproverChange = (
    selected: SingleValue<{ value: number; label: string }>,
    index: number
  ) => {
    const newApproverIDs = [...approverIDs]; // Create a copy of the current state array
    newApproverIDs[index] = selected?.value ?? 0; // Update the item at the `index`, fallback to 0 if not selected
    setApproverIDs(newApproverIDs); // Update the state with the new array
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!files) {
        setError("File is required");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("Title", title);
      formData.append("TypeID", selectedTypeID?.toString() ?? "");
      formData.append("Description", description);
      formData.append("DepartmentID", departmentID?.toString() ?? "");
      formData.append(
        "ApproverIDs",
        JSON.stringify(approverIDs.filter((id) => id !== 0))
      );

      files.forEach((item) => {
        formData.append("files", item.file);
      });

      if (approvalRequired) {
        formData.append(
          "ApproverIDs",
          JSON.stringify(approverIDs.filter((id) => id !== 0))
        );
      }

      const res = await fetch("/api/employee/create-document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload document");
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setSelectedTypeID(0);
      setDepartmentID(0);
      setFiles([]);
      setApprovers([]);
      console.log("document success")
      alert("Document successfully created!");
      router.push("/employee2/dashboard")
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files ? e.target.files[0] : null;
    if (newFile) {
      setFiles((prev) => [...prev, { file: newFile, requireEsign: false }]);
    }
  };

  // Handle opening e-sign interface for a specific file
  const handleOpenESign = async (file: File, index: number) => {
    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported for e-signing");
      return;
    }

    // Validate required fields before creating document
    if (!title.trim()) {
      alert("Please enter a document title before proceeding with e-signing.");
      return;
    }

    if (!selectedTypeID) {
      alert("Please select a document type before proceeding with e-signing.");
      return;
    }

    if (!departmentID) {
      alert("Please select a department before proceeding with e-signing.");
      return;
    }

    if (approverIDs.filter((id) => id !== 0).length === 0) {
      alert(
        "Please select at least one approver before proceeding with e-signing."
      );
      return;
    }

    // First, create the document in the database
    try {
      const formData = new FormData();
      files.forEach((item) =>
        formData.append("files", item.file, item.file.name)
      ); // "files" must match backend
      formData.append("Title", title);
      formData.append("Description", description);
      formData.append("TypeID", type.toString());
      formData.append("DepartmentID", departmentID?.toString() ?? "");
      const filteredApprovers = approverIDs.filter((id) => id !== 0);
      formData.append("ApproverIDs", JSON.stringify(filteredApprovers));

      const res = await fetch("/api/employee/create-document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create document");
      }

      const data = await res.json();
      const documentId = data.documentID;

      // Create blob URL for the file
      const fileUrl = URL.createObjectURL(file);

      // Prepare approvers data with proper user IDs for database
      const filterApprovers = approverIDs.filter((id) => id !== 0);
      const approversData = filterApprovers.map((id) => {
        const approver = approvers.find((a) => a.UserID === id);
        return {
          id: id.toString(), // Use actual user ID
          userId: id, // Database user ID
          name: approver
            ? `${approver.FirstName} ${approver.LastName}`
            : `Approver ${id}`,
        };
      });

      // Create URL parameters with the document ID
      const params = new URLSearchParams({
        docId: documentId.toString(),
        title: title.trim(),
        type: selectedType || "Unknown Type",
        department: department || "Unknown Department",
        approvers: encodeURIComponent(JSON.stringify(approversData)),
        file: fileUrl,
        userRole: "sender", // The person creating the document is automatically the sender
      });

      // Open e-sign interface in new tab with the document ID
      window.open(`/employee2/e-sign-document?${params.toString()}`, "_blank");
    } catch (error) {
      console.error("Error creating document:", error);
      alert(
        `Failed to create document: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleToggleEsign = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles[index].requireEsign = !updatedFiles[index].requireEsign;
    setFiles(updatedFiles);
  };

  const handleRemoveFile = (index: number) => {
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
    setTitle("");
    setClassification("Select Document Type");
    setDescription("");
    setDepartments([]);
    setDepartment("Select Department");
    setSelectedFile(null);
    setApprovers([]);
    setDate("");
    setDueDate("");
    setNotes("");
  };

  return (
    <div className={styles.container}>
      <EmpHeader />
      <div className={styles.contentContainer}>
        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Create New Document</h2>
          <hr className={styles.separator}></hr>

          <div className={styles.sectionTitle}>Information</div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <div className={styles.inputGroup}>
                <label>Document Name</label>
                <input
                  type="text"
                  placeholder="Enter document name"
                  className={styles.inputField}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Document Classification</label>
                <div className={styles.wrapper} ref={ref}>
                  <div
                    className={`${styles.display} ${openSelect1 ? styles.active : ""}`}
                    onClick={toggleSelectOpen1} // Toggle Document Classification dropdown
                  >
                    {selectedType}
                    <span
                      className={`${styles.arrow} ${openSelect1 ? styles.open : ""}`}
                    >
                      <svg
                        width="12"
                        height="7"
                        viewBox="0 0 12 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.19309 6.75194L0.983398 1.9257L2.71995 0.316895L6.19309 3.53444L9.66614 0.316895L11.4027 1.9257L6.19309 6.75194Z"
                          fill="black"
                        />
                      </svg>
                    </span>
                  </div>

                  <ul
                    className={`${styles.dropdown} ${openSelect1 ? styles.open : ""}`}
                  >
                    {documentTypes.map((type) => (
                      <li
                        key={type.TypeID}
                        onClick={() =>
                          handleDocumentSelect(type.TypeName, type.TypeID)
                        }
                      >
                        {type.TypeName}
                      </li>
                    ))}
                  </ul>
                </div>
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
              <div className={styles.wrapper}>
                <div
                  className={`${styles.display} ${openSelect2 ? styles.active : ""}`}
                  onClick={toggleSelectOpen2} // Toggle dropdown visibility
                >
                  {department}
                  {/* Display selected department */}
                  <span
                    className={`${styles.arrow} ${openSelect2 ? styles.open : ""}`}
                  >
                    <svg
                      width="12"
                      height="7"
                      viewBox="0 0 12 7"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.19309 6.75194L0.983398 1.9257L2.71995 0.316895L6.19309 3.53444L9.66614 0.316895L11.4027 1.9257L6.19309 6.75194Z"
                        fill="black"
                      />
                    </svg>
                  </span>
                </div>

                <ul
                  className={`${styles.dropdown} ${openSelect2 ? styles.open : ""}`}
                >
                  {departments.map((dep) => (
                    <li
                      key={dep.DepartmentID}
                      onClick={() =>
                        handleDepartmentSelect(dep.Name, dep.DepartmentID)
                      }
                    >
                      {dep.Name} {/* Display department name */}
                    </li>
                  ))}
                </ul>
              </div>
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
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>
                          {item.file.name}
                        </span>
                        {item.requireEsign && (
                          <span className={styles.eSignBadge}>
                            E-Sign Required
                          </span>
                        )}
                      </div>

                      <div className={styles.fileActions}>
                        <label className={styles.switchContainer}>
                          <input
                            type="checkbox"
                            checked={item.requireEsign}
                            onChange={() => handleToggleEsign(index)}
                          />
                          <span className={styles.switchSlider}></span>
                          <span className={styles.switchLabel}>
                            Require E-sign
                          </span>
                        </label>

                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => handleRemoveFile(index)}
                          aria-label="Remove file"
                        >
                          <X size={20} />
                        </button>

                        {item.requireEsign && (
                          <button
                            type="button"
                            className={styles.eSignBtn}
                            onClick={() => handleOpenESign(item.file, index)}
                            aria-label="Open e-sign interface"
                          >
                            Open E-Sign
                          </button>
                        )}
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
                      onClick={() => {
                        const input = document.querySelector(
                          `.${styles.hiddenInput}`
                        ) as HTMLInputElement;
                        if (input) {
                          input.click();
                        }
                      }}
                      className={styles.addFileBtn}
                    >
                      <Plus size={20} /> Add another file
                    </button>
                  )}
                </div>
              </>
            )}

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
                    <input
                      title="approval"
                      type="checkbox"
                      checked={approvalRequired}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setApprovalRequired(checked);
                        if (checked && approverIDs.length === 0) {
                          setApproverIDs([0]);
                        }
                      }}
                    />

                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              {approvalRequired &&
                approverIDs.map((id, index) => (
                  <div className={styles.approverRow} key={index}>
                    <span className={styles.approverNumber}>{index + 1}</span>

                    <Select
                      options={selectOptions}
                      value={
                        selectOptions.find((opt) => opt.value === id) || null
                      }
                      onChange={(selected) =>
                        handleApproverChange(selected, index)
                      }
                      placeholder="Select approver..."
                      isSearchable
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      styles={{
                        container: (base) => ({
                          ...base,
                          width: "auto",
                          minWidth: "120px",
                          maxWidth: "100%",
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
                  title="date"
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

        {/* Document Status Section */}
        {savedDocument && (
          <div className={styles.documentStatus}>
            <h3>Document Status</h3>
            <div className={styles.statusCard}>
              <h4>{savedDocument.title}</h4>
              <p>
                <strong>Status:</strong> {savedDocument.status}
              </p>
              <p>
                <strong>File:</strong>{" "}
                <a
                  href={savedDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document
                </a>
              </p>
              <div className={styles.statusInfo}>
                <p>✅ Document has been saved with signature placeholders</p>
                <p>📧 Signees have been notified automatically</p>
                <p>⏳ Waiting for all signatures to be completed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
