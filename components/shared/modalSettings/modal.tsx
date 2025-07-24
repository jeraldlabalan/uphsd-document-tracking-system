import React, { useRef, useState } from 'react';
import styles from './modal.module.css'; // 👈 import the CSS module

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Upload Photo</h2>
      <button className={styles.closeButton} onClick={onClose}>
  &times;
</button>
        <div className={styles.previewBox}>
          {previewSrc ? (
            <img src={previewSrc} alt="Preview" className={styles.previewImage} />
          ) : (
            <p>No photo selected.</p>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />

        

        <div className={styles.buttonGroup}>
          <button className={styles.change} onClick={() => fileInputRef.current?.click()}>Change</button>
          <button className={styles.apply}>Apply Photo</button>
        </div>
      </div>
    </div>
  );
};

export default UploadPhotoModal;
