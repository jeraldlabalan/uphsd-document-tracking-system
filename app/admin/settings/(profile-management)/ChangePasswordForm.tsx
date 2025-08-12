"use client";

import React, { useState } from "react";
import styles from "./ProfileManagement.module.css"; // keep your styles
import toast from "react-hot-toast";

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = (): void => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // Confirm passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    // Confirm dialog
    if (!window.confirm("Are you sure you want to change your password?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/settings/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to change password.");
      } else {
        toast.success(data.message || "Password updated successfully!");
        handleClear();
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className={styles.changePasswordWrapper}>
      <form className={styles.changePasswordContainer} onSubmit={handleSubmit}>
        <p className={styles.sectionTitle}>Change Password</p>

        <div className={styles.changePasswordContents}>
          <div className={styles.changePasswordDataForm}>
            <div className={styles.dataForm}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                name="currentPassword"
                placeholder="Enter current password"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.dataForm}>
              <label htmlFor="newPassword">New Password</label>
              <input
                name="newPassword"
                placeholder="Enter new password"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.dataForm}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                name="confirmPassword"
                placeholder="Confirm new password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className={styles.changePasswordButtons}>
          <button type="button" onClick={handleClear}>
            Clear
          </button>
          <button type="submit">Change Password</button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
