"use client";
import React from "react";
import { useState } from "react";
import styles from "./EditUser.module.css";
import HeaderDashboard from "@/components/shared/adminHeader/headerDashboard";
import Link from "next/link";

export default function CreateNewUser() {
  // Dropdown Buttons
  const departmentOptions: string[] = [
    "Select",
    "Information Technology",
    "Medicine",
    "Business",
    "Human Resource",
  ];
  const [isDepartmentOptionOpen, setIsDepartmentOptionOpen] =
    useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    departmentOptions[0]
  );

  const handleSelectedDepartment = (department: string) => {
    setSelectedDepartment(department);
    setIsDepartmentOptionOpen(!isDepartmentOptionOpen);
  };

  const positionOptions: string[] = ["Select", "Department Head", "Staff"];
  const [isPositionOptionOpen, setIsPositionOptionOpen] =
    useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<string>(
    positionOptions[0]
  );

  const handleSelectedPosition = (position: string) => {
    setSelectedPosition(position);
    setIsPositionOptionOpen(!isPositionOptionOpen);
  };

  return (
    <div className={styles.container}>
      <div>
        <HeaderDashboard />
      </div>

      <div className={styles.contentContainer}>
        <form action="#" className={styles.createAccountForm}>
          <h1 className={styles.formTitle}>Edit User Profile</h1>

          <div className={styles.formSection}>
            <h1 className={styles.sectionTitle}>personal information</h1>

            <div className={styles.personalInformationContainer}>
              <div className={styles.data}>
                <label htmlFor="fname">first name</label>
                <input
                  name="fname"
                  placeholder="Enter first name"
                  type="text"
                />
              </div>

              <div className={styles.data}>
                <label htmlFor="lname">last name</label>
                <input name="lname" placeholder="Enter last name" type="text" />
              </div>

              <div className={styles.data}>
                <label htmlFor="email">email address</label>
                <input
                  name="email"
                  placeholder="email@uphsd.edu.ph"
                  type="text"
                />
              </div>

              <div className={styles.data}>
                <label htmlFor="contact">mobile number</label>
                <input name="contact" placeholder="09XXXXXXXXX" type="text" />
              </div>

              <div className={styles.data}>
                <label htmlFor="sex">sex</label>
                <input name="sex" placeholder="Enter first name" type="text" />
              </div>

              <div className={styles.data}>
                <label htmlFor="id">identification number</label>
                <input name="id" placeholder="Enter id" type="text" />
              </div>

              <div className={styles.data}>
                <label htmlFor="id">department</label>
                <div className={styles.optionDropdownContainer}>
                  <button
                    className={`${
                      !isDepartmentOptionOpen
                        ? styles.optionBtn
                        : styles.activeOptionBtn
                    }`}
                    onClick={() =>
                      setIsDepartmentOptionOpen(!isDepartmentOptionOpen)
                    }
                  >
                    {selectedDepartment}
                    <span>
                      <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        className={styles.dropdownOptionIcon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 6.0006L0.757324 1.758L2.17154 0.34375L5 3.1722L7.8284 0.34375L9.2426 1.758L5 6.0006Z"
                          className={styles.dropdownOptionFill}
                        />
                      </svg>
                    </span>
                  </button>

                  {isDepartmentOptionOpen && (
                    <ul className={styles.tableDropdownMenu}>
                      {departmentOptions.map((option) => (
                        <li
                          key={option}
                          onClick={() => handleSelectedDepartment(option)}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className={styles.data}>
                <label htmlFor="id">position</label>
                <div className={styles.optionDropdownContainer}>
                  <button
                    className={`${
                      !isPositionOptionOpen
                        ? styles.optionBtn
                        : styles.activeOptionBtn
                    }`}
                    onClick={() =>
                      setIsPositionOptionOpen(!isPositionOptionOpen)
                    }
                  >
                    {selectedPosition}
                    <span>
                      <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        className={styles.dropdownOptionIcon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 6.0006L0.757324 1.758L2.17154 0.34375L5 3.1722L7.8284 0.34375L9.2426 1.758L5 6.0006Z"
                          className={styles.dropdownOptionFill}
                        />
                      </svg>
                    </span>
                  </button>

                  {isPositionOptionOpen && (
                    <ul className={styles.tableDropdownMenu}>
                      {positionOptions.map((option) => (
                        <li
                          key={option}
                          onClick={() => handleSelectedPosition(option)}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.temporaryPasswordContainer}>
            <h1 className={styles.sectionTitle}>Auto-Generated Password</h1>

            <div className={styles.temporaryPasswordSection}>
              <p>Temporary Password</p>
              <div className={styles.temporaryPasswordHolder}>202250709</div>
              <p>User must change password on first login</p>
            </div>
          </div>

          <div className={styles.buttonsContainer}>
            <Link href="/admin/user-management">
  <button className={styles.goBackButton}>back</button>
</Link>
            <div className={styles.formButtons}>
              <button className={styles.clearButton}>clear</button>
              <button
                type="submit"
                name="submit"
                className={styles.submitButton}
              >
                save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
