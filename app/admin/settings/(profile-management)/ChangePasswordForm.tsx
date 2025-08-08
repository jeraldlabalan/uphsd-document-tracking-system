// ChangePassword.tsx (with TypeScript)
import React, { useState } from "react";
import styles from "./ProfileManagement.module.css";  // Adjust path if necessary

// Define types for the input fields (you could expand this to include more specific validation)
interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordForm: React.FC = () => {
  // State to manage the form inputs
  const [formData, setFormData] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle change in input fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,  // Update the correct field based on the name attribute
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();  // Prevent default form submission
    console.log(formData);  // You can replace this with actual logic (e.g., API call)
  };

  // Handle clearing the form
  const handleClear = (): void => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
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
