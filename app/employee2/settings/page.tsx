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
  
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);


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
  const showAlert = (message: string) => {
  setAlertMessage(message);
  setIsAlertModalOpen(true);
};

const closeAlert = () => {
  setIsAlertModalOpen(false);
  setAlertMessage("");
};


  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const passwordRequirements = [
  {
    label: "Password at least 8 characters",
    test: (s: string) => s.length >= 8,
  },
  {
    label: "Password at least one uppercase letter",
    test: (s: string) => /[A-Z]/.test(s),
  },
  {
    label: "Password at least one lowercase letter",
    test: (s: string) => /[a-z]/.test(s),
  },
  {
    label: "Password at least one number",
    test: (s: string) => /\d/.test(s),
  },
  {
    label: "Password at least one special character (!@#$%^&*)",
    test: (s: string) => /[!@#$%^&*]/.test(s),
  },
];

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

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsConfirmModalOpen(true); // open modal first
};


const confirmSave = async () => {
  const payload: ProfilePayload = {
    firstName,
    lastName,
    mobileNumber,
    position,
    department,
  };

  try {
    const res: Response = await fetch("/api/employee/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse = await res.json();
    console.log(data);

    if (res.ok) {
      setIsConfirmModalOpen(false);
      // optional: show success modal instead of reload
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
    setIsConfirmModalOpen(false);
  }
};



  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // 1️⃣ Check requirements
  const unmetRequirements = passwordRequirements.filter(
    (req) => !req.test(newPassword)
  );

  if (unmetRequirements.length > 0) {
    showAlert(
      "Password requirement is not met"
    );
    return;
  }

  // 2️⃣ Check match
  if (newPassword !== confirmPassword) {
    showAlert("New passwords do not match.");
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
      showAlert("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfilePhoto(data.ProfilePhoto || "default.jpg");
    } else {
      showAlert(data.message || "Failed to update password");
    }
  } catch (err) {
    console.error(err);
    showAlert("Something went wrong.");
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
  type="button"
  className={styles.clearBtn}
  onClick={clearPasswordFields}
>
  Clear
</button>

                  <button className={styles.uploadBtn}>Change Password</button>
                </div>
              </form>
              
              
                            {/* Password Requirements */}
                           <ul className={styles.requirementsList}>
  {passwordRequirements.map((req, idx) => {
    const passed = req.test(newPassword);
    return (
      <li
        key={idx}
        className={passed ? styles.requirementPassed : styles.requirementFailed}
      >
        {passed ? "✔" : "✖"} {req.label}
      </li>
    );
  })}
</ul>

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
    type="tel"
    className={styles.inputField}
    name="mobile"
    value={mobileNumber}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, ""); // remove non-digits
      setMobileNumber(value);
    }}
    placeholder="09XXXXXXXXX"
    maxLength={11} // restrict to PH format (11 digits)
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
            uploadUrl="/api/employee/settings/upload-profile-picture"
          />
        )}
      </div>

      {isAlertModalOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalCard}>
      <p>{alertMessage}</p>
      <button onClick={closeAlert} className={styles.closeBtn}>
        OK
      </button>
    </div>
  </div>
)}

{isConfirmModalOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h2 className={styles.editmodalTitle}>Confirm Save</h2>
      <p>Are you sure you want to save these changes?</p>
      <div className={styles.modalActions}>
        <button
          onClick={() => setIsConfirmModalOpen(false)}
          className={styles.reactivatecancelButton}
        >
          Cancel
        </button>
        <button
          onClick={confirmSave}
          className={styles.confirmButton}
        >
          Yes, Save
        </button>
      </div>
    </div>
  </div>
)}



      
    </div>
  );
}
