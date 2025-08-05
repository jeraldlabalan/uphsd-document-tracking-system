import { useState } from "react";
import styles from "./Sidebar.module.css";
import { SidebarProps, Role } from "../types";
import CustomSelect from "@/components/custom-select/CustomSelect";


export default function Sidebar({
  role,
  signees,
  onRoleChange,
  onFileChange,
  placeholders,
  jumpToNextSignature,
  setModalOpen,
  setDraggingEnabled,
  hasSigned,
  resetSignaturePreview,
  setViewMode,
}: SidebarProps) {
  console.log("All placeholders", placeholders);
  console.log("Current role:", role);

  const remainingPlaceholders = placeholders.filter(
    (ph) => ph.signee === role && !ph.isSigned
  );

  console.log("Remaining placeholders", remainingPlaceholders);

  const departmentOptions = [
  "Engineering",
  "Business",
  "Information Technology",
  "Human Resource",
  "Medicine",
];

const [selectedDepartment, setSelectedDepartment] = useState("Select");


  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <label htmlFor="">document</label>
      </div>

      <label>
        Choose Role:
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as Role)}
        >
          <option value="sender">Sender</option>
          {signees.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Upload PDF:
        <input type="file" accept="application/pdf" onChange={onFileChange} />
      </label>

      {/* Drag and Drop */}
      {role === "sender" && (
        <div className={styles.senderButtons}>
          <button
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", "add-signature");
            }}
            className={styles.dragAndDropButton}
            onMouseDown={() => setDraggingEnabled(true)}
          >
            add signature
          </button>

          <button className={styles.saveFileButton}>save file</button>
        </div>
      )}

      {role !== "sender" && (
        <div className={styles.receiverButtons}>
          <p className={styles.signatureCount}>
            You have {remainingPlaceholders.length} signature placeholder
            {remainingPlaceholders.length === 1 ? "" : "s"} remaining.
          </p>

          <button
            className={styles.jumpToSignature}
            onClick={jumpToNextSignature}
          >
            Jump to Signature
          </button>

          <button
            onClick={() => {
              resetSignaturePreview();
              setViewMode("edit");
              setModalOpen(true);
            }}
            className={styles.signDocument}
          >
            {hasSigned ? "Re-upload Signature" : "Sign Document"}
          </button>

          <button className={styles.saveFileButton}>Save File</button>
        </div>
      )}

      <a href="" className={styles.backToDashboard}>
        Back to dashboard
      </a>

      <CustomSelect options={departmentOptions} value={selectedDepartment} onChange={(val) => setSelectedDepartment(val)} />
    </div>
  );
}
