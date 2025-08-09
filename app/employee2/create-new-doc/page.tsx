"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./createNewDocStyles.module.css";
import { FileUp, Plus, X } from "lucide-react";
import EmpHeader from "@/components/shared/empHeader";
import Link from "next/link";
import Select, { SingleValue } from "react-select";

type Approver = {
  UserID: number;
  FirstName: string;
  LastName: string;
};

export default function CreateNewDocument() {
  // State for tracking open/close state of dropdowns
  const [openSelect1, setOpenSelect1] = useState(false); // Document Classification
  const [openSelect2, setOpenSelect2] = useState(false); // Department

  // States to hold selected values
  const [selectedType, setSelectedType] = useState<string>(
    "Select Document Type"
  );
  const [department, setDepartment] = useState<string>("Select Department");
  const [documentTypes, setDocumentTypes] = useState<
    { TypeID: number; TypeName: string }[]
  >([]);

  const [departments, setDepartments] = useState<
    { DepartmentID: number; Name: string }[]
  >([]);

  const ref = useRef<HTMLDivElement>(null);

  const toggleSelectOpen1 = () => setOpenSelect1((prev) => !prev);
  const toggleSelectOpen2 = () => setOpenSelect2((prev) => !prev);

  // Handle department select
  const handleDepartmentSelect = (name: string) => {
    console.log("Selected Department:", name); // Log selected department
    setDepartment(name); // Update department value
    setOpenSelect2(false);
  };

  useEffect(() => {
    console.log("Open Select2 Status:", openSelect2); // Log current state of the dropdown
  }, [openSelect2]); // This will log whenever the dropdown state changes

  const handleDocumentSelect = (name: string, id: number) => {
    console.log(name);
    console.log(id);
    setDocumentName(name); // Update selected department
    setSelectedType(name);
    setOpenSelect1(false); // Close dropdown after selection
  };

  // Close dropdown when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (ref.current && !ref.current.contains(event.target as Node)) {
  //       setOpenSelect2(false); // Close dropdown when clicking outside
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  // useEffect(() => {
  //   console.log("Selected Department:", department); // Log whenever the department state changes
  // }, [department]); // This will log whenever department is updated

  // Log department value whenever it changes
  useEffect(() => {
    console.log("Current selected department:", department); // Log the department when it changes
  }, [department]);

  const [documentName, setDocumentName] = useState("");
  const [classification, setClassification] = useState("Select Document Type");
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
  const [approverIDs, setApproverIDs] = useState<number[]>([]); // or []
  const [files, setFiles] = useState<{ file: File; requireEsign: boolean }[]>(
    []
  );

  const [approvalRequired, setApprovalRequired] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  const selectOptions = approvers.map((user) => ({
    value: user.UserID,
    label: `${user.FirstName} ${user.LastName}`,
  }));

  // Fetch departments
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

        // Set default document type values (name & ID)
        if (data.length > 0) {
          setSelectedType(data[0].TypeName); // Default document type name
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

  // Handle Approver Change (example of setting approver IDs)
  const handleApproverChange = (
    selected: SingleValue<{ value: number; label: string }>,
    index: number
  ) => {
    const newApproverIDs = [...approverIDs]; // Create a copy of the current state array
    newApproverIDs[index] = selected?.value ?? 0; // Update the item at the `index`, fallback to 0 if not selected
    setApproverIDs(newApproverIDs); // Update the state with the new array
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const payload = {
      Title: title,
      Description: description,
      TypeID: type, // Use document type ID
      FilePath: filePath,
      DepartmentID: departmentID, // Use department ID
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
    const newFile = e.target.files ? e.target.files[0] : null;
    if (newFile) {
      setFiles((prev) => [...prev, { file: newFile, requireEsign: false }]);
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
                    {selectedType || "Select Document Type"}{" "}
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
                  onClick={toggleSelectOpen2}// Toggle dropdown visibility
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
                        onClick={() => handleDepartmentSelect(dep.Name)} // Pass both Name and ID
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
                      <span className={styles.fileName}>{item.file.name}</span>

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
                              setApproverIDs([0]); // Start with one blank approver slot
                            }
                          }}
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
                      options={selectOptions} // Your list of approvers
                      value={
                        selectOptions.find((opt) => opt.value === id) || null
                      }
                      onChange={(selected) =>
                        handleApproverChange(selected, index)
                      } // Pass the selected option and index
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
      </div>
    </div>
  );
}
