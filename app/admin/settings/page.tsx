"use client";
import React from "react";
import { useState } from "react";
import styles from "./adminSettings.module.css";
import Image from "next/image";
import HeaderDashboard from "@/components/shared/adminHeader/headerDashboard";
import AdminSidebar from "@/components/shared/adminSidebar/adminSidebar";
import samplePhoto from "../../../assets/profile-placeholder.jpg";

export default function Settings() {
  // department option
  const departmentOptions: string[] = [
    "Select",
    "Engineering",
    "Business",
    "Information Technology",
    "Human Resource",
    "Medicine",
  ];
  const [isDepartmentOptionsOpen, setIsDepartmentOptionsOpen] =
    useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    departmentOptions[0]
  );

  const handleSelectedDepartment = (department: string) => {
    setSelectedDepartment(department);
    setIsDepartmentOptionsOpen(!isDepartmentOptionsOpen);
  };

  return (
    <div className={styles.container}>
      <>
        <HeaderDashboard />
      </>

      <div className={styles.mainContanent}>
        <>
          <AdminSidebar />
        </>

        <div className={styles.rightContent}>
          <h1>settings</h1>
          <div className={styles.settingsContainer}>
            <div className={styles.profileContainer}>
              <div className={styles.displayPictureContainer}>
                <div className={styles.photoAndDescriptionContainer}>
                  <Image src={samplePhoto} alt="This is a photo" />

                  <div className={styles.description}>
                    <p>Kurt Macaranas</p>
                    <p>Admin</p>
                  </div>
                </div>

                <div className={styles.buttonAndNoteContainer}>
                  <button>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.08301 2.16309C1.08301 1.86591 1.32963 1.625 1.62023 1.625H11.3791C11.6758 1.625 11.9163 1.86601 11.9163 2.16309V10.8369C11.9163 11.1341 11.6697 11.375 11.3791 11.375H1.62023C1.32353 11.375 1.08301 11.134 1.08301 10.8369V2.16309ZM2.16634 2.70833V10.2917H10.833V2.70833H2.16634ZM6.49967 8.125C7.39716 8.125 8.12467 7.39749 8.12467 6.5C8.12467 5.60251 7.39716 4.875 6.49967 4.875C5.60219 4.875 4.87467 5.60251 4.87467 6.5C4.87467 7.39749 5.60219 8.125 6.49967 8.125ZM6.49967 9.20833C5.00391 9.20833 3.79134 7.99576 3.79134 6.5C3.79134 5.00423 5.00391 3.79167 6.49967 3.79167C7.99543 3.79167 9.20801 5.00423 9.20801 6.5C9.20801 7.99576 7.99543 9.20833 6.49967 9.20833ZM9.20801 3.25H10.2913V4.33333H9.20801V3.25Z"
                        fill="white"
                      />
                    </svg>
                    upload photo
                  </button>
                  <p>
                    Upload a professional photo to personalize your account.
                  </p>
                </div>
              </div>

              <div className={styles.informationContainer}>
                <p>information</p>

                <form action="" method="" className={styles.informationForm}>
                  <div className={styles.formContainer}>
                    <div className={styles.formData}>
                      <label htmlFor="fname">first name</label>
                      <input
                        name="fname"
                        placeholder="First Name"
                        type="text"
                      />
                    </div>

                    <div className={styles.formData}>
                      <label htmlFor="lname">last name</label>
                      <input name="lname" placeholder="Last Name" type="text" />
                    </div>

                    <div className={styles.formData}>
                      <label htmlFor="">email address</label>
                      <input
                        name="email"
                        placeholder="email address"
                        type="text"
                      />
                    </div>

                    <div className={styles.formData}>
                      <label htmlFor="">emplyee ID</label>
                      <input
                        name="employeeId"
                        placeholder="employee id"
                        type="text"
                      />
                    </div>

                    <div className={styles.formData}>
                      <label htmlFor="contact">mobile number</label>
                      <input
                        name="contact"
                        placeholder="contact number"
                        type="text"
                      />
                    </div>

                    <div className={styles.formData}>
                      <label htmlFor="">role</label>
                      <input placeholder="role" type="text" />
                    </div>

                    <div className={styles.optionDropdownContainer}>
                      <span>department</span>
                      <button
                        type="button"
                        className={`${
                          !isDepartmentOptionsOpen
                            ? styles.optionBtn
                            : styles.activeOptionBtn
                        }`}
                        onClick={() =>
                          setIsDepartmentOptionsOpen(!isDepartmentOptionsOpen)
                        }
                      >
                        {selectedDepartment ? selectedDepartment : "Select"}
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

                      {isDepartmentOptionsOpen && (
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

                    <div className={styles.formData}>
                      <label htmlFor="bio">Bio</label>
                      <textarea
                        placeholder="Enter bio"
                        rows={3}
                        name="bio"
                        id=""
                      ></textarea>
                    </div>
                  </div>

                  <div className={styles.buttonsContainer}>
                    <button>cancel</button>

                    <button>save changes</button>
                  </div>
                </form>
              </div>
            </div>

            <div className={styles.documentContainer}>
              <div className={styles.documentManagementContainer}>
                <p className={styles.sectionTitle}>document management</p>

                <div className={styles.parentSection}>
                  <div className={styles.maximumFileSizeSection}>
                    <p>maximum file size (MB)</p>
                    <input placeholder="Enter a number" type="number" />
                  </div>

                  <div className={styles.allowedFileTypesSection}>
                    <p>allowed file types</p>
                    <div className={styles.checkboxContainer}>
                      <label htmlFor="pdf">
                        <input name="pdf" id="pdf" type="checkbox" />
                        PDF
                      </label>
                      <label htmlFor="document">
                        <input name="document" id="document" type="checkbox" />
                        DOC / DOCX
                      </label>
                      <label htmlFor="spreadsheet">
                        <input
                          name="spreadsheet"
                          id="spreadsheet"
                          type="checkbox"
                        />
                        XLS / XLSX
                      </label>
                      <label htmlFor="img">
                        <input name="img" id="img" type="checkbox" />
                        IMG
                      </label>
                      <label htmlFor="png">
                        <input name="png" id="png" type="checkbox" />
                        PNG
                      </label>
                      <label htmlFor="jpg">
                        <input name="jpg" id="jpg" type="checkbox" />
                        JPG
                      </label>
                    </div>
                  </div>

                  <div className={styles.autoDeleteDocumentSection}>
                    <p>Auto-delete documents after (days)</p>
                    <div className={styles.inputAndButtonContainer}>
                      <input placeholder="Enter a number" type="number" />
                      <button>save document</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.departmentManagementContainer}>
                <p className={styles.sectionTitle}>department management</p>

                <div className={styles.departmentContents}>
                  <div className={styles.addNewDepartmentContainer}>
                    <label htmlFor="department">add new department</label>
                    <input
                      placeholder="Enter department name"
                      name="department"
                      id="department"
                      type="text"
                    />
                  </div>

                  <div className={styles.activeDepartmentContainer}>
                    <p>active departments</p>
                    <div className={styles.departmentList}>
                      <div className={styles.departmentListScroll}>
                        <ul>
                          <li>Human Resource</li>
                          <li>Information Technology</li>
                          <li>Business</li>
                          <li>Medicine</li>
                          <li>Human Resource</li>
                          <li>Information Technology</li>
                          <li>Business</li>
                          <li>Medicine</li>
                        </ul>
                      </div>

                      <div className={styles.departmentActionButtons}>
                        <button>add department</button>
                        <button>save</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <form className={styles.changePasswordContainer}>
                <p className={styles.sectionTitle}>change password</p>

                <div className={styles.changePasswordContents}>
                  <div className={styles.changePasswordDataForm}>
                    <div className={styles.dataForm}>
                      <label htmlFor="current">current password</label>
                      <input
                        name="current"
                        placeholder="Enter current password"
                        type="text"
                      />
                    </div>
                    <div className={styles.dataForm}>
                      <label htmlFor="new">new password</label>
                      <input
                        name="new"
                        placeholder="Enter current password"
                        type="text"
                      />
                    </div>
                    <div className={styles.dataForm}>
                      <label htmlFor="confirm">confirm password</label>
                      <input
                        name="confirm"
                        placeholder="Enter current password"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className={styles.changePasswordButtons}>
                    <button type="button">clear</button>
                    <button type="submit">change password</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
