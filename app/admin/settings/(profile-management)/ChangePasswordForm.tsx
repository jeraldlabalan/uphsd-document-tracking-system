"use client";

import React, { useState } from "react";
import styles from "./ProfileManagement.module.css";
import toast from "react-hot-toast";

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required.";
    }

    // Check password requirements
    const failedReq = passwordRequirements.find(
      (req) => !req.test(formData.newPassword)
    );
    if (failedReq) {
      newErrors.newPassword = `Password does not meet requirement: ${failedReq.label}`;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

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
              {errors.currentPassword && (
                <p className={styles.inputError}>{errors.currentPassword}</p>
              )}
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
              {errors.confirmPassword && (
                <p className={styles.inputError}>{errors.confirmPassword}</p>
              )}
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

      {errors.newPassword && (
                <p className={styles.inputError}>{errors.newPassword}</p>
              )}

              {/* Password Requirements */}
              <ul className={styles.passwordRequirements}>
                {passwordRequirements.map((req, index) => {
                  const isValid = req.test(formData.newPassword);
                  return (
                    <li
                      key={index}
                      className={isValid ? styles.valid : styles.invalid}
                    >
                      {isValid ? "✔" : "✖"} {req.label}
                    </li>
                  );
                })}
              </ul>
    </div>
  );
};

export default ChangePasswordForm;
