import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { SidebarProps, Role } from "../types";

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
  onSaveFile,
  onSavePlaceholders,
  onBackToDashboard,
  documentId,
  isDocumentCreator = false,
  onUndoChanges,
  isUndoing = false,
}: SidebarProps) {
  console.log("All placeholders", placeholders);
  console.log("Current role:", role);

  // For receivers, count only unsigned placeholders assigned to them
  const [userPlaceholders, setUserPlaceholders] = useState<typeof placeholders>(
    []
  );
  const [userSignedPlaceholders, setUserSignedPlaceholders] = useState<
    typeof placeholders
  >([]);

  // Get current user's placeholders
  useEffect(() => {
    const fetchUserPlaceholders = async () => {
      if (role === "receiver") {
        try {
          const userResponse = await fetch("/api/user/me");
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const currentUserId = userData.UserID;

            const userUnsigned = placeholders.filter(
              (ph) => !ph.isSigned && ph.assignedToId === currentUserId
            );
            const userSigned = placeholders.filter(
              (ph) => ph.isSigned && ph.assignedToId === currentUserId
            );

            setUserPlaceholders(userUnsigned);
            setUserSignedPlaceholders(userSigned);
          }
        } catch (error) {
          console.error("Error fetching user placeholders:", error);
        }
      } else {
        // For senders, show all placeholders they created
        const senderPlaceholders = placeholders.filter((ph) => !ph.isSigned);
        const senderSignedPlaceholders = placeholders.filter(
          (ph) => ph.isSigned
        );
        setUserPlaceholders(senderPlaceholders);
        setUserSignedPlaceholders(senderSignedPlaceholders);
      }
    };

    fetchUserPlaceholders();
  }, [role, placeholders]);

  const remainingPlaceholders = userPlaceholders;
  const signedPlaceholders = userSignedPlaceholders;
  const hasAnySignatures = hasSigned; // Use hasSigned prop directly since placeholders are cleared after signing

  console.log("Remaining placeholders", remainingPlaceholders);
  console.log("Signed placeholders", signedPlaceholders);
  console.log("Has any signatures", hasAnySignatures);

  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSavePlaceholders = async () => {
    if (!onSavePlaceholders) {
      alert("Cannot save placeholders. Save function is not available.");
      return;
    }

    if (placeholders.length === 0) {
      setModalMessage(
        "No signature placeholders to save. Please add at least one placeholder."
      );
      return;
    }

    // Validate that all placeholders have assigned signees
    const unassignedPlaceholders = placeholders.filter(
      (p) => !p.assignedToId && !p.signee
    );
    if (unassignedPlaceholders.length > 0) {
      setModalMessage(
        "All signature placeholders must have assigned signees before saving."
      );
      return;
    }

    try {
      await onSavePlaceholders(placeholders);
      setModalMessage(
        "Signature placeholders saved successfully! Signees will be notified."
      );
    } catch (error) {
      console.error("Error saving placeholders:", error);
      alert("Failed to save placeholders. Please try again.");
    }
  };

  return (
    <div className={styles.sidebar}>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.deletemodalContent}>
            <p>{modalMessage}</p>
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setShowModal(false);
                }}
                className={styles.OKButton}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.sidebarHeader}>
        <label htmlFor="">Document</label>
      </div>

      <div className={styles.roleDisplay}>
        <label>Current Role:</label>
        <span className={styles.roleValue}>
          {role === "sender" ? "Document Sender" : "Document Signee"}
        </span>
      </div>

      {/* Sender Role: Can only add signature placeholders and assign signees */}
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
            Add Signature Placeholder
          </button>

          <button
            className={styles.saveFileButton}
            onClick={handleSavePlaceholders}
            disabled={placeholders.length === 0}
          >
            Save Document with Placeholders
          </button>
        </div>
      )}

      {/* Receiver Role: Can sign documents and jump to signatures */}
      {role === "receiver" && (
        <div className={styles.receiverButtons}>
          <p className={styles.signatureCount}>
            You have {remainingPlaceholders.length} signature placeholder
            {remainingPlaceholders.length === 1 ? "" : "s"} remaining.
          </p>

          <button
            className={styles.jumpToSignature}
            onClick={jumpToNextSignature}
            disabled={remainingPlaceholders.length === 0}
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
            disabled={remainingPlaceholders.length === 0}
          >
            {hasSigned ? "Re-upload Signature" : "Sign Document"}
          </button>

          {/* Undo Changes Button - only show if user has signed */}
          {hasSigned && onUndoChanges && (
            <button
              onClick={onUndoChanges}
              className={styles.undoChangesButton}
              disabled={isUndoing}
            >
              {isUndoing ? 'Undoing...' : 'Undo Changes'}
            </button>
          )}

          <button
            className={styles.saveFileButton}
            onClick={onSaveFile}
            disabled={!hasAnySignatures}
          >
            Save Signed Document
          </button>
        </div>
      )}

      <button onClick={onBackToDashboard} className={styles.backToDashboard}>
        Back to Dashboard
      </button>
    </div>
  );
}
