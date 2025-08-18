"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./settingStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import Email from "next-auth/providers/email";
import UploadPhotoModal from "@/components/shared/modalSettings/modal";

export default function ProfileSettings() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const [profilePicture, setProfilePicture] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeID, setEmployeeID] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  interface ProfilePayload {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    position: string;
    department?: string;
  }

  interface ApiResponse {
    [key: string]: any;
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/employee/settings");
      const data = await res.json();

       console.log("Profile data:", data); // <--- Add this

      setEmail(data.Email || "");
      setEmployeeID(data.EmployeeID || "");
      setMobileNumber(data.MobileNumber || "");
      setPosition(data.Position || "");
      setDepartment(data.Department || "");
      setFirstName(data.FirstName || "");
      setLastName(data.LastName || "");

      // Simple profile picture logic - use ProfilePicture field like admin system
      if (data.ProfilePicture) {
        console.log("Using ProfilePicture:", data.ProfilePicture);
        setProfilePicture(data.ProfilePicture);
        setTempPreview(data.ProfilePicture);
      } else {
        console.log("No profile picture found, using default");
        setProfilePicture("/default.jpg");
        setTempPreview("/default.jpg");
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (
  e: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  e.preventDefault();

  const payload: ProfilePayload = {
    firstName,
    lastName,
    mobileNumber,
    position,
    department, // optional
  };

  const res: Response = await fetch("/api/employee/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data: ApiResponse = await res.json();
  console.log(data);

  if (res.ok) {
    // optional: show a success toast/modal before reload
    window.location.reload();
  }
};


  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/employee/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setProfilePhoto(data.ProfilePhoto || "default.jpg");
      } else {
        alert(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  const clearPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempPreview(URL.createObjectURL(file));
      setProfilePhoto(file);
    }
  };

  const applyPhoto = () => {
    if (tempPreview) {
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <EmpHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Profile Settings</h2>
          </div>

          <hr className={styles.separator} />
          <div className={styles.profileContainer}>
            <div className={styles.leftColumn}>
              {/* Profile Photo + Name */}
              <div className={styles.profileInfo}>
                <Image
                    src={tempPreview || profilePicture || "/default.jpg"}
                    alt="Profile"
                    className={styles.avatar}
                    width={150}
                    height={150}
                    onClick={() => setIsModalOpen(true)}
                    style={{ cursor: "pointer" }}
                    onError={(e) => {
                      console.error("Image failed to load:", e.currentTarget.src);
                      console.log("Falling back to default image");
                      e.currentTarget.src = "/default.jpg";
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully:", tempPreview || profilePicture || "/default.jpg");
                    }}
                  />
                <div className={styles.profileDetails}>
                  <h3 className={styles.name}>
                    {firstName} {lastName}
                  </h3>
                  <p className={styles.role}>{position}</p>
                </div>
              </div>

              {/* Upload Photo Section */}
              <div className={styles.uploadSection}>
                <button
                  className={styles.uploadBtn}
                  onClick={() => setIsModalOpen(true)}
                >
                  Upload Photo
                </button>
                <p className={styles.photoNote}>
                  Upload a professional photo to personalize your account.
                </p>
              </div>

              {/* Change Password Form */}
              <form
                className={styles.passwordSection}
                onSubmit={handlePasswordSubmit}
              >
                <h3>Change Password</h3>
                <div className={styles.inputGroup}>
                  <label>Current password</label>
                  <input
                    type="password"
                    className={styles.inputField}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>New Password</label>
                  <input
                    type="password"
                    className={styles.inputField}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className={styles.inputField}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.clearBtn}
                    onClick={clearPasswordFields}
                  >
                    Clear
                  </button>
                  <button className={styles.uploadBtn}>Change Password</button>
                </div>
              </form>
            </div>

            {/* Right Column: Information Section */}
            <form className={styles.rightColumn} onSubmit={handleSave}>
              <div className={styles.infoSection}>
                <h3>Information</h3>
                <div className={styles.formGroup}>
                  <div className={styles.inputGroup}>
                    <label>First Name</label>
                    <input
                      className={styles.inputField}
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Last Name</label>
                    <input
                      className={styles.inputField}
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input
                      className={styles.inputField}
                      name="email"
                      value={email}
                      readOnly
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Employee ID</label>
                    <input
                      className={styles.inputField}
                      name="employeeId"
                      value={employeeID}
                      onChange={(e) => setEmployeeID(e.target.value)}
                      readOnly
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.inputGroup}>
                    <label>Mobile Number</label>
                    <input
                      className={styles.inputField}
                      name="mobile"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Position</label>
                    <input
                      className={styles.inputField}
                      name="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      readOnly
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Department</label>
                  <input
                    className={styles.inputField}
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    readOnly
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button className={styles.clearBtn} type="button">
                    Cancel
                  </button>
                  <button className={styles.uploadBtn} type="submit">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ✅ Modal */}
        {isModalOpen && (
          <UploadPhotoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUploadSuccess={(data: any) => {
              console.log("Profile picture uploaded:", data);
              
              // Use profilePicture field from response like admin system
              if (data.profilePicture) {
                setTempPreview(data.profilePicture);
                setProfilePicture(data.profilePicture);
              }
              setIsModalOpen(false);
              // Refresh the profile data to get updated information
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}
