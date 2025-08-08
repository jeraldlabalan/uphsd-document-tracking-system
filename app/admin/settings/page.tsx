"use client";
import React, { useState } from "react";
import styles from "./adminSettings.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import DepartmentManagement from "./(management-entities)/DepartmentManagement";
import PositionManagement from "./(management-entities)/PositionManagement";
import DocumentManagement from "./(management-entities)/DocumentManagement";
import InformationForm from "./(profile-management)/InformationForm";
import ChangePasswordForm from "./(profile-management)/ChangePasswordForm";
import ProfileDisplay from "./(profile-management)/ProfileDisplay";
import profile from "../../../assets/profile-placeholder.jpg";
import Modal from "./(modal)/Modal";

export default function Settings() {
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [rowToDelete, setRowToDelete] = useState<string | null>(null); // Row to delete
  const [isLoading, setIsLoading] = useState(false); // For loading effect

  const profileData = {
    profileImage: profile, // This should be URL, imported sample photo
    name: "John Doe",
    role: "Software Developer",
    description: "Upload a professional photo to personalize your account",
  };

  const handleRemoveRow = () => {
    // Simulate async task (e.g., delete operation)
    setIsLoading(true); // Start loading
    setTimeout(() => {
      console.log(`Row ${rowToDelete} deleted`);
      setIsLoading(false); // End loading
      setRowToDelete(null); // Clear row after deletion
    }, 2000); // Simulate 2-second delay
  };

  return (
    <div>
      <AdminHeader />

      <div className={styles.container}>
        <div className={styles.rightContent}>
          <h1>Settings</h1>

          <div className={styles.settingsContainer}>
            {/* Profile Section */}
            <div className={styles.profileContainer}>
              <ProfileDisplay
                profileImage={profileData.profileImage}
                name={profileData.name}
                role={profileData.role}
                description={profileData.description}
              />
              <InformationForm />
              <ChangePasswordForm />
            </div>

            {/* Document and Management Section */}
            <div className={styles.documentContainer}>
              <DocumentManagement />
              <hr />
              <DepartmentManagement
                setShowModal={setShowModal}
                setRowToDelete={setRowToDelete}
              />
              <hr />
              <PositionManagement />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Confirmation */}
      <Modal
        showModal={showModal} // Pass the modal visibility
        setShowModal={setShowModal} // Pass the setShowModal function
        description={`Are you sure you want to delete this department?`} // Dynamic description
        onConfirm={handleRemoveRow} // Pass the confirm action function
        onCancel={() => setShowModal(false)} // Close modal on cancel
        isLoading={isLoading} // Show loading spinner during action
      />
    </div>
  );
}
