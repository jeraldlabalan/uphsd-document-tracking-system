"use client";
import Head from "next/head";
import styles from "./settingStyles.module.css";
import { useState, useEffect } from "react";
// import EmployeeSidebar from "@/components/shared/employeeSidebar/employeeSidebar";
// import EmployeeHeader from "@/components/shared/employeeHeader/employeeHeader";
import UploadPhotoModal from "@/components/shared/modalSettings/modal";

export default function Setting() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeID, setEmployeeID] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

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

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/employee/settings");
      const data = await res.json();

      // ✅ Fill your form fields here:
      setEmail(data.Email || "");
      setEmployeeID(data.EmployeeID || "");
      setMobileNumber(data.MobileNumber || "");
      setPosition(data.Position || "");
      setDepartment(data.Department || "");
      setFirstName(data.FirstName || "");
      setLastName(data.LastName || "");
    };

    fetchProfile();
  }, []);

  return (
    <>
      <div className={styles.Maincontainer}>
        <Head>
          <title>Setting</title>
        </Head>

        {/* <EmployeeHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} /> */}

        <div className={styles.container}>
          {/* <EmployeeSidebar sidebarOpen={sidebarOpen} /> */}

          <main className={styles.main}>
            <div className={styles.headerRow}>
              <h1 className={styles.heading}>Profile Settings</h1>
            </div>

            {/* ➤ Wrapper with Two Independent Columns */}
            <div className={styles.gridWrapper}>
              {/* Left: Change Password Form */}

              <div className={styles.leftColumn}>
                <div className={styles.ChangeContainer}>
                  <div className={styles.profileContainer}>
                    <div className={styles.profileLeft}>
                      <img
                        src={profilePhoto ? profilePhoto : "/default.jpg"}
                        alt="Profile"
                        className={styles.profilePic}
                      />
                    </div>

                    <div className={styles.profileRight}>
                      <div className={styles.profileInfo}>
                        <h1 className={styles.name}>
                          {firstName} {lastName}
                        </h1>
                        <h2 className={styles.pos}>{position}</h2>
                      </div>

                      <div className={styles.uploadSection}>
                        <button
                          className={styles.uploadButton}
                          onClick={() => setIsModalOpen(true)}
                        >
                          <img
                            src="/camera-icon.svg"
                            alt="camera"
                            className={styles.icon}
                          />
                          Upload Photo
                        </button>
                        <UploadPhotoModal
                          isOpen={isModalOpen}
                          onClose={() => setIsModalOpen(false)}
                          onUploadSuccess={(filename) => {
                            setProfilePhoto(filename);
                            setIsModalOpen(false);
                          }}
                        />

                        <p className={styles.note}>
                          Upload a professional photo to personalize your
                          account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form className={styles.form} onSubmit={handlePasswordSubmit}>
                    <h2 className={styles.formTitle}>Change Password</h2>

                    <label className={styles.label}>Current Password</label>
                    <input
                      type="password"
                      className={styles.input}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />

                    <label className={styles.label}>New Password</label>
                    <input
                      type="password"
                      className={styles.input}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <label className={styles.label}>Confirm New Password</label>
                    <input
                      type="password"
                      className={styles.input}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <div className={styles.buttonGroup}>
                      <button type="button" className={styles.cancelButton}>
                        Cancel
                      </button>
                      <button type="submit" className={styles.button}>
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right: Personal Info Form */}
              <div className={styles.rightColumn}>
                <div className={styles.formContainer}>
                  <form className={styles.form} onSubmit={handleSave}>
                    <h2 className={styles.formTitle}>Personal Information</h2>

                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>First Name</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Last Name</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={email}
                          readOnly
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Employee ID</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={employeeID}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Mobile Number</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Position</label>
                        <select
                          className={styles.input}
                          value={position} // ✅ Binds to state
                          onChange={(e) => setPosition(e.target.value)} // ✅ Updates state when changed
                        >
                          <option value="">Select Position</option>
                          <option value="it">IT Coordinator</option>
                          <option value="manager">Manager</option>
                          <option value="staff">Staff</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Department</label>
                      <select className={styles.input}>
                        <option value="">Select Department</option>
                        <option value="hr">Human Resources</option>
                        <option value="it">IT</option>
                        <option value="finance">Finance</option>
                      </select>
                    </div>

                    <div className={styles.buttonGroup}>
                      <button type="button" className={styles.cancelButton}>
                        Cancel
                      </button>
                      <button type="submit" className={styles.button}>
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
