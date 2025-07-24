"use client";
import Head from 'next/head'
import styles from './settings.module.css'
import { useState } from 'react';
import EmployeeSidebar from "@/components/shared/employeeSidebar/employeeSidebar";
import EmployeeHeader from "@/components/shared/employeeHeader/employeeHeader";
import UploadPhotoModal from "@/components/shared/modalSettings/modal";

export default function Setting() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  return (
    <>
      <div className={styles.Maincontainer}>
        <Head>
          <title>Setting</title>
        </Head>

          <EmployeeHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        


         
        <div className={styles.container}>
          <EmployeeSidebar sidebarOpen={sidebarOpen} />
          

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
    <img src="/" alt="Profile" className={styles.profilePic} />
  </div>

  <div className={styles.profileRight}>
    <div className={styles.profileInfo}>
      <h1 className={styles.name}>Kurt Macaranas</h1>
      <h2 className={styles.pos}>IT Coordinator</h2>
    </div>

    <div className={styles.uploadSection}>
      <button className={styles.uploadButton} onClick={() => setIsModalOpen(true)}>
        <img src="/camera-icon.svg" alt="camera" className={styles.icon} />
        Upload Photo
      </button>
      <UploadPhotoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <p className={styles.note}>
        Upload a professional photo to personalize your account.
      </p>
    </div>
  </div>
</div>

        <form className={styles.form}>
          <h2 className={styles.formTitle}>Change Password</h2>

          <label className={styles.label}>Current Password</label>
          <input type="password" className={styles.input} />

          <label className={styles.label}>New Password</label>
          <input type="password" className={styles.input} />

          <label className={styles.label}>Confirm New Password</label>
          <input type="password" className={styles.input} />

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.button}>Change Password</button>
          </div>
        </form>
      </div>
    </div>

    {/* Right: Personal Info Form */}
    <div className={styles.rightColumn}>
      <div className={styles.formContainer}>
        <form className={styles.form}>
          <h2 className={styles.formTitle}>Personal Information</h2>

<div className={styles.inputRow}>
  <div className={styles.inputGroup}>
    <label className={styles.label}>First Name</label>
    <input type="text" className={styles.input} />
  </div>
  <div className={styles.inputGroup}>
    <label className={styles.label}>Last Name</label>
    <input type="text" className={styles.input} />
  </div>
</div>

<div className={styles.inputRow}>
  <div className={styles.inputGroup}>
    <label className={styles.label}>Email Address</label>
    <input type="email" className={styles.input} />
  </div>
  <div className={styles.inputGroup}>
    <label className={styles.label}>Employee ID</label>
    <input type="text" className={styles.input} />
  </div>
</div>

<div className={styles.inputRow}>
  <div className={styles.inputGroup}>
    <label className={styles.label}>Mobile Number</label>
    <input type="tel" className={styles.input} />
  </div>
  <div className={styles.inputGroup}>
    <label className={styles.label}>Position</label>
    <select className={styles.input}>
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

<div className={styles.inputGroup}>
  <label className={styles.label}>Bio</label>
  <textarea className={styles.textarea} placeholder="Tell us about yourself..."></textarea>
</div>

<div className={styles.buttonGroup}>
  <button type="button" className={styles.cancelButton}>Cancel</button>
  <button type="submit" className={styles.button}>Save Changes</button>
</div>
        
        </form>
      </div>
    </div>
  </div>
</main>

        </div>
      </div>
    </>
  )
}
