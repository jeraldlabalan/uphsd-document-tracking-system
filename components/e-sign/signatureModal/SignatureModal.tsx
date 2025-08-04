import Modal from "react-modal";
import SignatureCanvas from "react-signature-canvas";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { SignatureModalProps } from "../../e-sign/types";
import styles from "./SignatureModal.module.css";

const SignatureModal = ({
  modalOpen,
  setModalOpen,
  applySignature,
  signatureImage,
  setSignatureImage,
}: SignatureModalProps) => {
  const canvasRef = useRef<SignatureCanvas>(null);

  const [mode, setMode] = useState<"draw" | "upload">("draw");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedSignature, setUploadedSignature] = useState<string | null>(
    null
  );

  const [imgDims, setImgDims] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const el = document.getElementById("__next");
      if (el) {
        Modal.setAppElement(el);
      } else {
        console.warn("Could not find #__next element to set as appElement.");
      }
    }
  }, []);

  const clearOtherInput = () => {
    if (mode === "draw" && canvasRef.current) {
      canvasRef.current.clear();
    } else {
      setUploadedSignature(null);
      setImgDims(null);
    }
    setSignatureImage(null);
  };

  const handleDrawSave = () => {
    if (canvasRef.current && !canvasRef.current.isEmpty()) {
      const dataUrl = canvasRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      setSignatureImage(dataUrl);
      alert("Signature saved! Click 'Apply to PDF'");
    } else {
      alert("Please draw something first.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        setImgDims({ width: img.width, height: img.height });
      };
      img.src = base64;

      setUploadedSignature(base64);
      setSignatureImage(base64);
      alert("Signature image uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleApplyClick = () => {
    if (!signatureImage) {
      alert("Please provide a signature first.");
      return;
    }

    applySignature(signatureImage); // Now applySignature should use the image already stored in state
    setModalOpen(false);
    setUploadedSignature(null);
    setImgDims(null);
  };

  return (
    <Modal
      isOpen={modalOpen}
      onRequestClose={() => setModalOpen(false)}
      contentLabel="Signature Modal"
      appElement={
        typeof window !== "undefined"
          ? (document.getElementById("__next") ?? undefined)
          : undefined
      }
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      {/* Toggle Buttons */}
      <div className={styles.toggleButtons}>
        <button
          onClick={() => {
            setMode("draw");
            clearOtherInput();
          }}
          className={` ${mode === "draw" ? styles.toggleActive : styles.signatureButton} `}
        >
          Draw
        </button>

        <button
          onClick={() => {
            setMode("upload");
            clearOtherInput();
          }}
          className={` ${mode === "upload" ? styles.toggleActive : styles.signatureButton} `}
        >
          Upload
        </button>
      </div>

      <div className={styles.userSignaturePlaceholder}>
        {/* Conditional UI */}
        {mode === "draw" && (
          <div className={styles.drawContainer}>
            <SignatureCanvas
              ref={canvasRef}
              penColor="black"
              backgroundColor="transparent"
              canvasProps={{ className: styles.sigCanvas }}
            />
            <button
              onClick={handleDrawSave}
              className={styles.saveDrawnSignature}
            >
              Save Drawn Signature
            </button>
          </div>
        )}

        {mode === "upload" && (
          <>
            <div
              className={styles.uploadDropZone}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                placeholder="file"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              {!uploadedSignature && <span>Upload Signature</span>}

              {uploadedSignature && imgDims && (
                <div className={styles.userUploadedSignatureContainer}>
                  <Image
                    src={uploadedSignature}
                    width={1}
                    height={1}
                    className={styles.uploadedImageSignature}
                    alt="Uploaded Signature"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <button
        onClick={async () => {
          if (!signatureImage) {
            alert("Please provide a signature first.");
            return;
          }
          await applySignature(signatureImage); // ✅
          setModalOpen(false);
        }}
      >
        Apply Signature
      </button>
    </Modal>
  );
};

export default SignatureModal;
