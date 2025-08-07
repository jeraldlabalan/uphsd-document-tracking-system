"use client";
import React from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import styles from "./adminSettings.module.css";
import Image from "next/image";
import AdminHeader from "@/components/shared/adminHeader";
import AdminSidebar from "@/components/shared/adminSidebar/adminSidebar";
import samplePhoto from "../../../assets/profile-placeholder.jpg";
import { Vault } from "lucide-react";
import DepartmentManagement from "./(management-entities)/DepartmentManagement";
import PositionManagement from "./(management-entities)/PositionManagement";
import DocumentManagement from "./(management-entities)/DocumentManagement";
import InformationForm from "./(profile-management)/InformationForm";

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

  // add position

  type PositionRown = {
    id: string;
    value: string;
  };

  const [rows, setRows] = useState<PositionRown[]>([
    { id: uuidv4(), value: "" },
  ]);

  const handleAddRow = () => {
    setRows([...rows, { id: uuidv4(), value: "" }]);
  };

  const handleRemoveRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleInputChange = (id: string, newValue: string) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, value: newValue } : row))
    );
  };

  {
    /* Modal States */
  }
  const [showModal, setShowModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<string | null>(null);

  type RowType = { id: string; value: string };

  // DOCUMENT rows
  const [documentRows, setDocumentRows] = useState<RowType[]>([
    { id: uuidv4(), value: "" },
  ]);
  const handleAddDocumentRow = () => {
    setDocumentRows([...documentRows, { id: uuidv4(), value: "" }]);
  };
  const handleRemoveDocumentRow = (id: string) => {
    setDocumentRows(documentRows.filter((row) => row.id !== id));
  };
  const handleDocumentInputChange = (id: string, newValue: string) => {
    setDocumentRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, value: newValue } : row))
    );
  };

  // DEPARTMENT rows
  const [departmentRows, setDepartmentRows] = useState<RowType[]>([
    { id: uuidv4(), value: "" },
  ]);
  const handleAddDepartmentRow = () => {
    setDepartmentRows([...departmentRows, { id: uuidv4(), value: "" }]);
  };
  const handleRemoveDepartmentRow = (id: string) => {
    setDepartmentRows(departmentRows.filter((row) => row.id !== id));
  };
  const handleDepartmentInputChange = (id: string, newValue: string) => {
    setDepartmentRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, value: newValue } : row))
    );
  };

  // POSITION rows
  const [positionRows, setPositionRows] = useState<RowType[]>([
    { id: uuidv4(), value: "" },
  ]);
  const handleAddPositionRow = () => {
    setPositionRows([...positionRows, { id: uuidv4(), value: "" }]);
  };
  const handleRemovePositionRow = (id: string) => {
    setPositionRows(positionRows.filter((row) => row.id !== id));
  };
  const handlePositionInputChange = (id: string, newValue: string) => {
    setPositionRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, value: newValue } : row))
    );
  };

  return (
    <div>
      <AdminHeader />

      <div className={styles.container}>
        <div className={styles.rightContent}>
          <h1>settings</h1>

          <div className={styles.settingsContainer}>
            {/* Profile */}
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

              <InformationForm />

              <div className={styles.positionManagementContainer}>
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
                          placeholder="Enter new password"
                          type="text"
                        />
                      </div>
                      <div className={styles.dataForm}>
                        <label htmlFor="confirm">confirm password</label>
                        <input
                          name="confirm"
                          placeholder="Confirm new password"
                          type="text"
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.changePasswordButtons}>
                    <button type="button">clear</button>
                    <button type="submit">change password</button>
                  </div>
                </form>
              </div>
            </div>

            {/* Document Management */}
            <div className={styles.documentContainer}>
              
              <DocumentManagement />
              <hr />
              <DepartmentManagement />
              <hr />
              <PositionManagement />
            </div>
          </div>

          {showModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3 className={styles.deletemodalTitle}>Confirm</h3>
                <p>Are you sure you want to delete this position?</p>
                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowModal(false);
                      setRowToDelete(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className={styles.confirmButton}
                    onClick={() => {
                      if (rowToDelete !== null) {
                        handleRemoveRow(rowToDelete);
                        setRowToDelete(null);
                        setShowModal(false);
                      }
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
