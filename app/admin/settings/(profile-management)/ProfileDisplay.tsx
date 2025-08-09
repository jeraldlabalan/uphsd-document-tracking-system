import React, { useState } from "react";
import styles from "./ProfileManagement.module.css"; // Adjust path if necessary
import Image from "next/image";

// Define types for the ProfileDisplay component
interface ProfileDisplayProps {
  profileImage: string; // URL for the profile image
  name: string; // User's name
  role: string; // User's role
  description: string; // Description or bio of the user
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({
  profileImage,
  name,
  role,
  description,
}) => {
  const [image, setImage] = useState(profileImage); // State for the uploaded image



  // Handle image upload (you can replace this with an actual file upload logic)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImage(reader.result as string); // Update the profile image with the uploaded file
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.profileGrid}>
      {/* Section 1: Profile Photo */}
      <div className={styles.profileItem}>
        <div className={styles.imageContainer}>
            <Image 
        src={image} 
        alt="Profile" 
        className={styles.profileImage}
        width={150} 
        height={150} 
        objectFit="cover"
         />
        </div>
      </div>

      {/* Section 2: Name and Role */}
      <div className={styles.profileItem}>
        <h3>{name}</h3>
        <p>{role}</p>
      </div>

      {/* Section 3: Upload Photo Button */}
      <div className={styles.profileItem}>
        
        <label htmlFor="upload-photo">
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

          <span>upload photo</span>
        </label>

        <input
          id="upload-photo"
          title="upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className={styles.uploadButton}
        />

      </div>

      {/* Section 4: Description Text */}
      <div className={styles.profileItem}>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default ProfileDisplay;
