import React, { useState, useEffect, useRef } from "react";
import styles from "./Modal.module.css"; // Adjust path if necessary

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
  const [success, setSuccess] = useState(false); // Track success state
  const modalRef = useRef<HTMLDivElement>(null);

  // Effect to simulate processing during loading
  useEffect(() => {
    if (isLoading) {
      setIsProcessing(true);
      // Simulate loading time of 2 seconds
      setTimeout(() => {
        setIsProcessing(false);
        setSuccess(true); // After loading, show success message
      }, 2000); // 2 seconds loading time
    }
  }, [isLoading]);

  // Reset success state when modal opens
  useEffect(() => {
    if (showModal) {
      setSuccess(false); // Reset success state when modal opens
    }
  }, [showModal]);

  // Close modal if clicked outside of modal content, but not during loading
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isProcessing && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false); // Close modal if clicked outside and not processing
      }
    };

    // Add event listener when modal is open and processing is false
    if (showModal && !isProcessing) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup listener on unmount
    };
  }, [showModal, isProcessing]); // Make sure dependencies stay constant

  return (
    showModal && (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent} ref={modalRef}>
          <h3 className={styles.deletemodalTitle}>
            {success ? "Success" : "Confirm"}
          </h3>

          {/* Show loading spinner only when processing */}
          {isProcessing && <div className={styles.spinner}></div>}

          {/* Description is hidden during loading */}
          {!isProcessing && <p>{!success ? description : ""}</p>}

          <div className={styles.modalActions}>
            {/* Only show buttons when not processing */}
            {!isProcessing && !success && (
              <>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    onCancel(); // Trigger the cancel function
                    setShowModal(false); // Close the modal
                  }}
                >
                  Cancel
                </button>

                <button
                  className={styles.confirmButton}
                  onClick={() => {
                    onConfirm(); // Trigger the confirm function
                  }}
                  disabled={isProcessing} // Disable the button during loading
                >
                  {isProcessing ? "" : "Continue"}
                </button>
              </>
            )}

            {/* Show success message and OK button after completion */}
            {success && (
              <button
                className={styles.okButton}
                onClick={() => setShowModal(false)} // Close modal after success
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
