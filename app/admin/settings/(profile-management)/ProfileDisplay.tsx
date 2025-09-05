import React, { useState, useEffect } from "react";
import styles from "./ProfileManagement.module.css";
import Image from "next/image";
import toast from "react-hot-toast";
import UploadPhotoModal from "@/components/shared/modalSettings/modal";

// Define types for the ProfileDisplay component
interface ProfileDisplayProps {
  profileImage: string; // URL for the profile image
  name: string; // User's name
  role: string; // User's role
  description: string; // Description or bio of the user
  onProfileUpdate?: (newProfilePicture: string) => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({
  profileImage,
  name,
  role,
  description,
  onProfileUpdate,
}) => {
  const [image, setImage] = useState(profileImage);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update local image state when profileImage prop changes
  useEffect(() => {
    setImage(profileImage);
  }, [profileImage]);

  // Check if profile image exists and is not default
  const hasProfileImage =
    image &&
    image !== "" &&
    !image.includes("profile-placeholder") &&
    !image.includes("default") &&
    !image.includes("profile-placeholder.jpg") &&
    image !== "/uploads/profiles/" &&
    image !== "/uploads/profiles" &&
    image !== "/profile-placeholder.jpg" &&
    image !== "/default.jpg";

  // Debug: log the values to see what's happening
  console.log("ProfileDisplay Debug:");
  console.log("- image:", image);
  console.log("- profileImage prop:", profileImage);
  console.log("- hasProfileImage:", hasProfileImage);
  console.log("- name:", name);

  // Get user initials from name (firstname only)
  const getUserInitials = (fullName: string) => {
    if (!fullName) return "U";
    const names = fullName.trim().split(" ");
    return names[0].charAt(0).toUpperCase(); // Only first letter of firstname
  };

  const handleUploadSuccess = (data: any) => {
    try {
      const newUrl = data?.profilePicture || "";
      if (newUrl) {
        setImage(newUrl);
        if (onProfileUpdate) {
          onProfileUpdate(newUrl);
        }
        window.dispatchEvent(new CustomEvent("userInfoUpdated"));
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error("Upload succeeded but no profile URL returned.");
      }
    } catch (e) {
      toast.error("An error occurred after upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.profileGrid}>
      {/* Section 1: Profile Photo */}
      <div className={styles.profileItem}>
        <div className={styles.imageContainer}>
          {hasProfileImage ? (
            <Image
              src={image}
              alt="Profile"
              className={styles.profileImage}
              width={150}
              height={150}
              objectFit="cover"
            />
          ) : (
            <div
              className={styles.profileImage}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                backgroundColor: "#FCCB0A", // Same yellow as header
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7F1416", // Same maroon as header
                fontSize: "4rem",
                fontWeight: "bold",
                boxShadow: "0 0 4px rgba(0, 0, 0, 0.2)", // Same shadow as header
              }}
            >
              {getUserInitials(name)}
            </div>
          )}
          {isUploading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
              }}
            >
              <div style={{ color: "white", fontSize: "14px" }}>
                Uploading...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Name and Role */}
      <div className={styles.profileItem}>
        <h3>{name}</h3>
        <p>{role}</p>
      </div>

      {/* Section 3: Upload Photo Button */}
      <div className={styles.profileItem}>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#8a1538",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            opacity: isUploading ? 0.6 : 1,
          }}
          disabled={isUploading}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.0830078 1.16309C0.0830078 0.865912 0.329634 0.625 0.620233 0.625H10.3791C10.6758 0.625 10.9163 0.866015 10.9163 1.16309V9.83691C10.9163 10.1341 10.6697 10.375 10.3791 10.375H0.620233C0.323535 10.375 0.0830078 10.134 0.0830078 9.83691V1.16309ZM1.16634 1.70833V9.29167H9.83301V1.70833H1.16634ZM5.49967 7.125C6.39716 7.125 7.12467 6.39749 7.12467 5.5C7.12467 4.60251 6.39716 3.875 5.49967 3.875C4.60219 3.875 3.87467 4.60251 3.87467 5.5C3.87467 6.39749 4.60219 7.125 5.49967 7.125ZM5.49967 8.20833C4.00391 8.20833 2.79134 6.99576 2.79134 5.5C2.79134 4.00423 4.00391 2.79167 5.49967 2.79167C6.99543 2.79167 8.20801 4.00423 8.20801 5.5C8.20801 6.99576 6.99543 8.20833 5.49967 8.20833ZM8.20801 2.25H9.29134V3.33333H8.20801V2.25Z"
              fill="white"
            />
          </svg>
          <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
        </button>
      </div>

      {/* Section 4: Description Text */}
      <div className={styles.profileItem}>
        <p>{description}</p>
      </div>

      {isModalOpen && (
        <UploadPhotoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          uploadUrl="/api/admin/settings/upload-profile-picture"
        />
      )}
    </div>
  );
};

export default ProfileDisplay;
