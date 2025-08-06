"use client";
import React, { useState } from "react";
import styles from "./ProfileManagement.module.css"; // change to your CSS module filename
import CustomSelect from "@/components/custom-select/CustomSelect";

/** Define the shape of our form data fields */
interface FormData {
  fname: string;
  lname: string;
  email: string;
  employeeId: string;
  contact: string;
  role: string;
}

/** Strict typing for dropdown options */
const departmentOptions: string[] = [
  "Human Resources",
  "Information Technology",
  "Business",
  "Marketing",
];

const InformationForm: React.FC = () => {
  /** State for standard input fields */
  const [formData, setFormData] = useState<FormData>({
    fname: "",
    lname: "",
    email: "",
    employeeId: "",
    contact: "",
    role: "",
  });

  /** State for handling dropdown selection */
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>("Select")


  /** Handles onChange for standard input fields */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  /** Reset states to clear the form */
  const handleCancel = (): void => {
    setFormData({
      fname: "",
      lname: "",
      email: "",
      employeeId: "",
      contact: "",
      role: "",
    });
    setSelectedDepartment(null);
  };

  /** Demo save logic — replace with API request later */
  const handleSave = (): void => {
    console.log({
      ...formData,
      department: selectedDepartment,
    });
  };

  return (
    <div className={styles.informationContainer}>
      <p>information</p>

      <form action="" method="" className={styles.informationForm}>
        <div className={styles.formContainer}>
          {/* FIRST NAME */}
          <div className={styles.formData}>
            <label htmlFor="fname">first name</label>
            <input
              name="fname"
              placeholder="First Name"
              type="text"
              value={formData.fname}
              onChange={handleChange}
            />
          </div>

          {/* LAST NAME */}
          <div className={styles.formData}>
            <label htmlFor="lname">last name</label>
            <input
              name="lname"
              placeholder="Last Name"
              type="text"
              value={formData.lname}
              onChange={handleChange}
            />
          </div>

          {/* EMAIL */}
          <div className={styles.formData}>
            <label>email address</label>
            <input
              name="email"
              placeholder="email address"
              type="text"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* EMPLOYEE ID */}
          <div className={styles.formData}>
            <label>employee id</label>
            <input
              name="employeeId"
              placeholder="employee id"
              type="text"
              value={formData.employeeId}
              onChange={handleChange}
            />
          </div>

          {/* CONTACT */}
          <div className={styles.formData}>
            <label htmlFor="contact">mobile number</label>
            <input
              name="contact"
              placeholder="contact number"
              type="text"
              value={formData.contact}
              onChange={handleChange}
            />
          </div>

          {/* ROLE */}
          <div className={styles.formData}>
            <label>role</label>
            <input
              name="role"
              placeholder="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
            />
          </div>

          {/* DROPDOWN (Department) */}
          <div className={styles.formData}>
            <label>department</label>
            <CustomSelect options={departmentOptions} value={selectedDepartment } onChange={setSelectedDepartment}/>
          </div>
        </div>

        {/* ACTION BUTTONS AT BOTTOM */}
        <div className={styles.buttonsContainer}>
          <button type="button" onClick={handleCancel}>
            cancel
          </button>
          <button type="button" onClick={handleSave}>
            save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default InformationForm;
