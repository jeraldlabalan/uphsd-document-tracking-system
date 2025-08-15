"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./createNewDocStyles.module.css";
import { FileUp, Plus, X } from "lucide-react";
import EmpHeader from "@/components/shared/empHeader";
import Link from "next/link";
import Select, { SingleValue } from "react-select";
import { useRouter } from "next/navigation"; // ✅ Correct import for App Router
import AOS from "aos";
import "aos/dist/aos.css";


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
    setOpenSelect2(false);
  };

  useEffect(() => {
    console.log("Open Select2 Status:", openSelect2); // Log current state of the dropdown
  }, [openSelect2]); // This will log whenever the dropdown state changes

  const handleDocumentSelect = (name: string, id: number) => {
    console.log(name);
    console.log(id);
    setSelectedType(name);
    setSelectedTypeID(id);
    setClassification(name); // Update classification display
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
  const [documentType, setDocumentType] = useState(0);
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
            AOS.init({
              duration: 1000,
              once: true,
            });
          }, []);

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
        // Only fetch approvers if a department is selected
        if (!departmentID) {
          setApprovers([]);
          return;
        }

        const res = await fetch(`/api/employee/create-document/approvers?departmentId=${departmentID}`);
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
  }, [departmentID]); // Changed dependency to departmentID

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
    // Check if we have a saved document with placeholders from e-sign
    const savedDocumentTitle = localStorage.getItem("documentWithPlaceholdersTitle");
    const savedDocumentDescription = localStorage.getItem("documentWithPlaceholdersDescription");
    const savedDocumentType = localStorage.getItem("documentWithPlaceholdersType");
    const savedDocumentDepartment = localStorage.getItem("documentWithPlaceholdersDepartment");
    const savedDocumentApprovers = localStorage.getItem("documentWithPlaceholdersApprovers");
    const savedDocumentPlaceholders = localStorage.getItem("documentWithPlaceholdersPlaceholders");

    if (savedDocumentTitle && savedDocumentPlaceholders) {
      // Clear localStorage immediately to prevent duplicate processing
      localStorage.removeItem("documentWithPlaceholdersTitle");
      localStorage.removeItem("documentWithPlaceholdersDescription");
      localStorage.removeItem("documentWithPlaceholdersType");
      localStorage.removeItem("documentWithPlaceholdersDepartment");
      localStorage.removeItem("documentWithPlaceholdersApprovers");
      localStorage.removeItem("documentWithPlaceholdersPlaceholders");

      // Update form fields with saved document data
      if (savedDocumentTitle) setTitle(savedDocumentTitle);
      if (savedDocumentDescription) setDescription(savedDocumentDescription);
      if (savedDocumentType) setSelectedType(savedDocumentType);
      if (savedDocumentDepartment) setDepartment(savedDocumentDepartment);

      // Update document type ID if we can find a match
      if (savedDocumentType) {
        const typeMatch = documentTypes.find(t => t.TypeName === savedDocumentType);
        if (typeMatch) setSelectedTypeID(typeMatch.TypeID);
      }

      // Update department ID if we can find a match
      if (savedDocumentDepartment) {
        const deptMatch = departments.find(d => d.Name === savedDocumentDepartment);
        if (deptMatch) setDepartmentID(deptMatch.DepartmentID);
      }

      // Update approvers if we have the data
      if (savedDocumentApprovers) {
        try {
          const approversData = JSON.parse(savedDocumentApprovers);
          if (Array.isArray(approversData)) {
            const approverIds = approversData.map((a: any) => a.userId || a.id);
            setApproverIDs(approverIds);
            setApprovalRequired(true);
          }
        } catch (error) {
          console.error("Error parsing approvers data:", error);
        }
      }

      // Set the saved document state to display in UI
      setSavedDocument({
        title: savedDocumentTitle,
        url: "Document with placeholders ready for submission",
        status: "Awaiting Signatures",
        placeholders: savedDocumentPlaceholders ? JSON.parse(savedDocumentPlaceholders) : [],
      });

      // Show success message with more details
      alert(
        `Document "${savedDocumentTitle}" has been saved with signature placeholders!\n\nWhat happens next:\n1. The document is now ready for signees to review\n2. Signees will be notified automatically\n3. They can access the document through their dashboard\n4. Once all signatures are complete, the document will be fully processed`
      );
    }
  }, [documentTypes, departments]);

  // State for saved document display
  const [savedDocument, setSavedDocument] = useState<{
    title: string;
    url: string;
    status: string;
    placeholders?: any[]; // Added placeholders to state
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
      // Files are now optional - they can be hardcopy documents
      // Only validate files if they are provided
      if (files && files.length > 0) {
        // Validate that uploaded files are valid
        for (const fileItem of files) {
          if (!fileItem.file || fileItem.file.size === 0) {
            setError("Please ensure all uploaded files are valid");
            setLoading(false);
            return;
          }
        }
      }

      // Check if we have a saved document with placeholders
      const savedDocumentData = localStorage.getItem("documentWithPlaceholdersData");
      const savedDocumentPlaceholders = localStorage.getItem("documentWithPlaceholdersPlaceholders");
      const savedDocumentId = localStorage.getItem("documentWithPlaceholdersId");

      if (savedDocumentData && savedDocumentPlaceholders) {
        // If we have a document with placeholders, use that instead of creating a new one
        try {
          const placeholders = JSON.parse(savedDocumentPlaceholders);
          
          // Create FormData for the document with placeholders
          const formData = new FormData();
          formData.append("Title", title);
          formData.append("TypeID", selectedTypeID?.toString() ?? "");
          formData.append("Description", description);
          formData.append("DepartmentID", departmentID?.toString() ?? "");
          formData.append(
            "ApproverIDs",
            JSON.stringify(approverIDs.filter((id) => id !== 0))
          );

          // Convert base64 data back to a File object
          const base64Response = await fetch(savedDocumentData);
          const blob = await base64Response.blob();
          const file = new File([blob], `document-with-placeholders.pdf`, { type: 'application/pdf' });
          formData.append("files", file);

          // Add placeholders data
          formData.append("Placeholders", JSON.stringify(placeholders));

          const res = await fetch("/api/employee/create-document", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to upload document");
          }

          // Clear localStorage
          localStorage.removeItem("documentWithPlaceholdersData");
          localStorage.removeItem("documentWithPlaceholdersTitle");
          localStorage.removeItem("documentWithPlaceholdersId");
          localStorage.removeItem("documentWithPlaceholdersType");
          localStorage.removeItem("documentWithPlaceholdersDepartment");
          localStorage.removeItem("documentWithPlaceholdersApprovers");
          localStorage.removeItem("documentWithPlaceholdersDescription");
          localStorage.removeItem("documentWithPlaceholdersPlaceholders");

          setSuccess(true);
          setTitle("");
          setDescription("");
          setSelectedTypeID(0);
          setDepartmentID(0);
          setFiles([]);
          setApprovers([]);
          setSavedDocument(null);
          console.log("document with placeholders success");
          alert("Document with placeholders successfully created!");
          router.push("/employee2/dashboard");
        } catch (error) {
          console.error("Error creating document with placeholders:", error);
          throw new Error("Failed to create document with placeholders");
        }
      } else {
        // Regular document creation (files and approvers are optional)
        const formData = new FormData();
        formData.append("Title", title);
        formData.append("TypeID", selectedTypeID?.toString() ?? "");
        formData.append("Description", description);
        formData.append("DepartmentID", departmentID?.toString() ?? "");
        
        // Only append approvers if they are selected
        if (approverIDs.filter((id) => id !== 0).length > 0) {
          formData.append(
            "ApproverIDs",
            JSON.stringify(approverIDs.filter((id) => id !== 0))
          );
        } else {
          // No approvers selected - send empty array to indicate department-wide notification
          formData.append("ApproverIDs", JSON.stringify([]));
        }

        // Only append files if they are provided
        if (files && files.length > 0) {
          files.forEach((item) => {
            formData.append("files", item.file);
          });
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
        console.log("document success");
        
        // Show appropriate success message based on whether files and approvers were provided
        if (files && files.length > 0 && approverIDs.filter((id) => id !== 0).length > 0) {
          alert("Document successfully created with files and specific approvers!");
        } else if (files && files.length > 0) {
          alert("Document successfully created with files! Document requests have been created for all department members so they can review and take action on the document.");
        } else if (approverIDs.filter((id) => id !== 0).length > 0) {
          alert("Document successfully created! This is a hardcopy document that requires wet signatures.");
        } else {
          alert("Document successfully created! Document requests have been created for all department members so they can track the hardcopy document status, put it on hold, or add remarks about any issues.");
        }
        
        router.push("/employee2/dashboard");
      }
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

    // Validate required fields before opening e-sign interface
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

    try {

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

      // Create URL parameters for the e-sign interface
      const params = new URLSearchParams({
        title: title.trim(),
        type: selectedType || "Unknown Type",
        department: department || "Unknown Department",
        approvers: JSON.stringify(approversData), // Don't double-encode
        file: fileUrl,
        userRole: "sender", // The person creating the document is automatically the sender
      });

      // Open e-sign interface in new tab
      window.open(`/employee2/e-sign-document?${params.toString()}`, "_blank");
    } catch (error) {
      console.error("Error opening e-sign interface:", error);
      alert(
        `Failed to open e-sign interface: ${error instanceof Error ? error.message : "Unknown error"}`
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
      <div className={styles.contentContainer} data-aos="fade-up">
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
              <div className={styles.sectionDescription}>
                Upload PDF files for digital documents, or leave empty for hardcopy documents. Document requests will be created for all department members so they can track status, take actions, and add remarks about any issues.
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="file" className={styles.label}>
                Document Files (Optional)
              </label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  multiple
                  className={styles.fileInput}
                />
                <label htmlFor="file" className={styles.fileLabel}>
                  <FileUp size={20} />
                  <span>Choose files or drag and drop</span>
                </label>
              </div>
              {files.length > 0 && (
                <div className={styles.fileList}>
                  {files.map((item, index) => (
                    <div key={index} className={styles.fileItem}>
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
                  ))}
                </div>
              )}
              {files.length === 0 && (
                <div className={styles.noFilesMessage}>
                  <p>No files uploaded. This will be treated as a hardcopy document requiring wet signatures.</p>
                </div>
              )}
            </div>

            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Approvers (Optional)</div>
              <div className={styles.sectionDescription}>
                Select specific approvers for digital review, or leave empty to create document requests for all department members. All department members will receive document requests and can take actions like approve, hold, reject, or add remarks about issues.
              </div>
            </div>

            <div className={styles.approvalContainer}>
              <div className={styles.approvalHeader}>
                <p>
                  Select the people who need to review and approve this document
                  in order, or leave empty for department-wide notification.
                </p>
              </div>

              {approverIDs.map((id, index) => (
                <div className={styles.approverRow} key={index}>
                  <span className={styles.approverNumber}>{index + 1}</span>
                  <Select
                    options={selectOptions}
                    value={selectOptions.find((option) => option.value === id)}
                    onChange={(selected) =>
                      handleApproverChange(selected, index)
                    }
                    placeholder="Select approver"
                    className={styles.selectField}
                  />
                  {approverIDs.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeApprover(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className={styles.addBtn}
                onClick={addApprover}
              >
                + Add New Approver
              </button>
            </div>

            <div className={styles.formGroup}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Document"}
              </button>
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
                  View Document with Placeholders
                </a>
              </p>
              
              {/* Display Signature Placeholders */}
              {savedDocument.placeholders && savedDocument.placeholders.length > 0 && (
                <div className={styles.placeholdersSection}>
                  <h5>Signature Placeholders</h5>
                  <div className={styles.placeholdersList}>
                    {savedDocument.placeholders.map((placeholder: any, index: number) => (
                      <div key={index} className={styles.placeholderItem}>
                        <div className={styles.placeholderInfo}>
                          <span className={styles.placeholderLabel}>
                            Placeholder {index + 1}
                          </span>
                          <span className={styles.placeholderSignee}>
                            Assigned to: {placeholder.signeeName || `User ${placeholder.assignedToId || placeholder.signee}`}
                          </span>
                          <span className={styles.placeholderLocation}>
                            Page {placeholder.page + 1}
                          </span>
                        </div>
                        <div className={styles.placeholderStatus}>
                          <span className={styles.statusPending}>⏳ Pending Signature</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Current Document File */}
              {savedDocument.url && (
                <div className={styles.currentDocumentSection}>
                  <h5>Current Document</h5>
                  <div className={styles.documentFileInfo}>
                    <div className={styles.fileDetails}>
                      <span className={styles.fileName}>
                        📄 Document with Placeholders
                      </span>
                      <span className={styles.fileStatus}>
                        Status: Ready for Signatures
                      </span>
                    </div>
                    <div className={styles.fileActions}>
                      <a
                        href={savedDocument.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.viewDocumentBtn}
                      >
                        👁️ View Document
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={styles.statusInfo}>
                <p>✅ Document has been saved with signature placeholders</p>
                <p>📧 Signees have been notified automatically</p>
                <p>⏳ Waiting for all signatures to be completed</p>
                <p>🔄 You can continue editing this document or wait for signatures</p>
              </div>
              
              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.editPlaceholdersBtn}
                  onClick={() => {
                    // Open e-sign interface again for the same document
                    const placeholders = savedDocument?.placeholders;
                    if (placeholders && placeholders.length > 0) {
                      // Create a new file object from the saved document URL
                      fetch(savedDocument.url)
                        .then(response => response.blob())
                        .then(blob => {
                          const file = new File([blob], `document-with-placeholders.pdf`, { type: 'application/pdf' });
                          
                          // Prepare approvers data
                          const approversData = approverIDs.filter(id => id !== 0).map(id => {
                            const approver = approvers.find(a => a.UserID === id);
                            return {
                              id: id.toString(),
                              userId: id,
                              name: approver ? `${approver.FirstName} ${approver.LastName}` : `Approver ${id}`,
                            };
                          });

                          // Create URL parameters (don't pass file blob URL)
                          const params = new URLSearchParams({
                            docId: placeholders[0]?.documentId || 'unknown',
                            title: title,
                            type: selectedType,
                            department: department,
                            approvers: JSON.stringify(approversData), // Don't double-encode
                            userRole: "sender",
                          });

                          // Open e-sign interface in new tab
                          window.open(`/employee2/e-sign-document?${params.toString()}`, "_blank");
                        })
                        .catch(error => {
                          console.error("Error opening document for editing:", error);
                          alert("Failed to open document for editing. Please try again.");
                        });
                    }
                  }}
                >
                  ✏️ Edit Placeholders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
