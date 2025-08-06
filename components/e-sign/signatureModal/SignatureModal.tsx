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
  onApplyComplete,
}: SignatureModalProps) => {
  const canvasRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
  if (modalOpen) {
    setSignatureImage(null);
    setUploadedSignature(null);
    setImgDims(null);
    canvasRef.current?.clear();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [modalOpen]);



  const [mode, setMode] = useState<"draw" | "upload">("upload");

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
      <div className={styles.modalHeader}>
        <span>
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.2864 13.7237L20.2846 12.7219L6.26041 26.7462H0.25V20.7357L16.2777 4.708L24.2917 12.7219C24.8449 13.2751 24.8449 14.1722 24.2917 14.7254L14.2743 24.7426L12.2708 22.7392L21.2864 13.7237ZM22.2881 0.70106L26.2951 4.708C26.8483 5.26124 26.8483 6.15823 26.2951 6.71147L24.2917 8.71493L18.2812 2.70452L20.2846 0.70106C20.838 0.147824 21.7349 0.147824 22.2881 0.70106Z"
              fill="black"
            />
          </svg>

          <h1>electronic signature</h1>
        </span>

        <span onClick={() => setModalOpen(false)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5859 10.0001L0.792969 2.20718L2.20718 0.792969L10.0001 8.58582L17.793 0.792969L19.2072 2.20718L11.4143 10.0001L19.2072 17.7929L17.793 19.2072L10.0001 11.4143L2.20718 19.2072L0.792969 17.7929L8.5859 10.0001Z"
              fill="black"
            />
          </svg>
        </span>
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
              onEnd={() => {
                const dataUrl = canvasRef.current
                  ?.getTrimmedCanvas()
                  .toDataURL("image/png");
                if (dataUrl) {
                  setSignatureImage(dataUrl);
                }
              }}
            />
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
              {!uploadedSignature && (
                <>
                  <svg
                    width="66"
                    height="42"
                    viewBox="0 0 66 42"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M34.3461 4.83639H62.25C64.045 4.83639 65.5 5.86528 65.5 7.13447V39.3075C65.5 40.5768 64.045 41.6056 62.25 41.6056H3.75C1.95509 41.6056 0.5 40.5768 0.5 39.3075V2.53831C0.5 1.26913 1.95509 0.240234 3.75 0.240234H27.8461L34.3461 4.83639ZM59 18.6249H7V37.0095H59V18.6249ZM59 14.0287V9.43254H31.6539L25.1538 4.83639H7V14.0287H59Z"
                      fill="black"
                    />
                  </svg>
                  <span>Upload an image of your signature.</span>
                </>
              )}

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
      
      {/* Toggle Buttons */}
      <div className={styles.toggleButtons}>
        <p>Choose method of signature</p>

        <div className={styles.buttonsContainer}>
          <button
            onClick={() => {
              setMode("upload");
              clearOtherInput();
            }}
            className={` ${mode === "upload" ? styles.toggleActive : styles.signatureButton} `}
          >
            upload signature
          </button>

          <button
            onClick={() => {
              setMode("draw");
              clearOtherInput();
            }}
            className={` ${mode === "draw" ? styles.toggleActive : styles.signatureButton} `}
          >
            draw signature
          </button>
        </div>
      </div>

      <button
        className={styles.applySignature}
        onClick={async () => {
          if (!signatureImage) {
            alert("Please provide a signature first.");
            return;
          }
          const signedUrl = await applySignature(signatureImage);
          if (signedUrl) {
            onApplyComplete(signedUrl); // updates PDF url in page.tsx
            setModalOpen(false); // close modal
          }
        }}
      >
        Apply Signature
      </button>
    </Modal>
  );
};

export default SignatureModal;
