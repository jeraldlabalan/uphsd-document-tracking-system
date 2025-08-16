import React, { useState, useEffect, useRef } from "react";
import styles from "./Modal.module.css"; // Adjust path if necessary
import AOS from "aos";
import "aos/dist/aos.css";

// Modal props interface should match the props passed from Settings.tsx
interface ModalProps {
  showModal: boolean; // Controls modal visibility
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>; // Function to toggle modal visibility
  description: string; // Description to display inside the modal
  onConfirm: () => void; // Action to take when confirming the modal
  onCancel: () => void; // Action to take when canceling the modal
  isLoading: boolean; // Loading state for async operations (e.g., deletion)
}

const Modal: React.FC<ModalProps> = ({
  showModal,
  setShowModal,
  description,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const [isProcessing, setIsProcessing] = useState(false); // Loading state
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync processing state with external loading flag if provided
  useEffect(() => {
    setIsProcessing(isLoading);
  }, [isLoading]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Reset processing state when modal opens
  useEffect(() => {
    if (showModal) {
      setIsProcessing(false); // Reset processing state when modal opens
      // Hide body scroll when modal opens
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = "unset";
    }
  }, [showModal]);

  // Cleanup body scroll when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Prevent escape key from closing modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showModal]);

  // Prevent outside click from closing modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Debug function to log modal interactions
  const logModalAction = (action: string, details?: any) => {
    console.log(`[Modal Debug] ${action}:`, {
      showModal,
      isProcessing,
      description,
      details
    });
  };

  return (
    showModal && (
      <div className={styles.modalOverlay} onClick={handleOverlayClick}>
        <div data-aos="zoom-in" className={styles.modalContent} ref={modalRef}>
          <h3 className={styles.deletemodalTitle}>
            {isProcessing ? "Processing..." : "Confirm"}
          </h3>

          {/* Show loading spinner only when processing */}
          {isProcessing && <div className={styles.spinner}></div>}

          {/* Description is hidden during loading */}
          {!isProcessing && <p>{description}</p>}

          <div className={styles.modalActions}>
            {/* Only show action buttons for confirmation flows (not during loading) */}
            {!isProcessing && (
              <>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    logModalAction("Cancel button clicked");
                    onCancel(); // Trigger the cancel function
                    setShowModal(false); // Close the modal
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </button>

                <button
                  className={styles.confirmButton}
                  onClick={async () => {
                    try {
                      logModalAction("Confirm button clicked", { 
                        onConfirm: onConfirm.toString(),
                        onConfirmType: typeof onConfirm,
                        onConfirmName: onConfirm.name || 'anonymous'
                      });
                      
                      // Check if onConfirm is properly defined
                      if (typeof onConfirm !== 'function') {
                        logModalAction("Error: onConfirm is not a function", { onConfirm });
                        console.error("Modal Error: onConfirm is not a function:", onConfirm);
                        return;
                      }
                      
                      setIsProcessing(true);
                      logModalAction("Calling onConfirm function");
                      console.log("[Modal Debug] Executing function:", onConfirm.toString());
                      await onConfirm(); // Await completion of the action
                      logModalAction("onConfirm function completed successfully");
                      // Modal will close automatically after action completes
                      // The parent component will handle the toast and modal closing
                    } catch (error) {
                      logModalAction("Error in onConfirm function", { error });
                      console.error("Error in modal confirm:", error);
                    } finally {
                      setIsProcessing(false);
                      logModalAction("Processing state reset to false");
                    }
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Confirm"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
