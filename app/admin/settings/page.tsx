"use client";
import React, { useState, useEffect } from "react";
import styles from "./adminSettings.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import DepartmentManagement from "./(management-entities)/DepartmentManagement";
import PositionManagement from "./(management-entities)/PositionManagement";
import DocumentManagement from "./(management-entities)/DocumentManagement";
import InformationForm from "./(profile-management)/InformationForm";
import ChangePasswordForm from "./(profile-management)/ChangePasswordForm";
import ProfileDisplay from "./(profile-management)/ProfileDisplay";
import Loading from "@/app/loading";
import Modal from "./(modal)/Modal";
import AOS from "aos";
import "aos/dist/aos.css";

interface UserInfo {
  FirstName: string | null;
  LastName: string | null;
  Email: string;
  EmployeeID: string | null;
  MobileNumber: string | null;
  Sex: string | null;
  Position: string | null;
  Role: string | null;
  ProfilePicture: string | null;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export default function Settings() {
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [rowToDelete, setRowToDelete] = useState<string | null>(null); // Row to delete
  const [isLoading, setIsLoading] = useState(false); // For loading effect
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);



useEffect(() => {
            AOS.init({
              duration: 1000,
              once: true,
            });
          }, []);

  useEffect(() => {
  const fetchUserInfo = async () => {
    try {
      setLoading(true); // ✅ start loader
      const response = await fetch("/api/admin/settings/user-info");

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else {
        console.error("Failed to fetch user info");
        setUserInfo(null);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUserInfo(null);
    } finally {
      setLoading(false); // ✅ stop loader
    }
  };

  fetchUserInfo();

  // Listen for custom events to automatically refresh user info
  const handleUserInfoUpdate = () => {
    fetchUserInfo();
  };

  window.addEventListener("userInfoUpdated", handleUserInfoUpdate);

  return () => {
    window.removeEventListener("userInfoUpdated", handleUserInfoUpdate);
  };
}, []);


  const handleUserInfoUpdate = (updatedInfo: Partial<UserInfo>) => {
    if (userInfo) {
      // Update local state immediately for instant display
      const newUserInfo = { ...userInfo, ...updatedInfo };
      setUserInfo(newUserInfo);

      // Also dispatch event to update admin header
      window.dispatchEvent(new CustomEvent("userInfoUpdated"));
    }
  };

  const handleProfileUpdate = (newProfilePicture: string) => {
    if (userInfo) {
      setUserInfo({ ...userInfo, ProfilePicture: newProfilePicture });
    }
  };

  const profileData = {
    profileImage: userInfo?.ProfilePicture || "", // Don't fallback to default image
    name: userInfo
      ? `${userInfo.FirstName || ""} ${userInfo.LastName || ""}`.trim() || ""
      : "",
    role: userInfo?.Role || "",
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


  if (loading) {
      return <Loading />;
    }
  return (
    <div>
      <AdminHeader />

      <div className={styles.container} data-aos="fade-up">
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
                onProfileUpdate={handleProfileUpdate}
              />
              <InformationForm
                userInfo={userInfo}
                onUserInfoUpdate={handleUserInfoUpdate}
              />
              <ChangePasswordForm />
            </div>

            {/* Document and Management Section */}
            <div className={styles.documentContainer}>
              <DocumentManagement />
              <hr />
              <DepartmentManagement />
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
