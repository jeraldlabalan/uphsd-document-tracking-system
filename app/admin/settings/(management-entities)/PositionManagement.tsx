"use client";
import React, { useState } from "react";
import styles from "./ManagementStyles.module.css";
import Modal from "../(modal)/Modal"; // Correct path if necessary

interface InputRow {
  id: string | number;
  value: string;
}

interface ActiveItem {
  id: string | number;
  name: string;
  checked: boolean;
}

const PositionManagement: React.FC = () => {
  const [rows, setRows] = useState<InputRow[]>([{ id: 1, value: "" }]);
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([
    { id: 20, name: "Manager", checked: true },
    { id: 21, name: "Assistant", checked: true },
  ]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Success state for confirmation

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: Date.now(), value: "" }]);
  };

  const handleChangeRow = (id: number | string, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  };

  const handleRemoveRow = (id: number | string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDeleteActiveItem = (id: number | string) => {
    // Reset success state before opening the modal
    setSuccess(false); // Reset success message
    setRowToDelete(id.toString()); // Set the position to delete
    setShowModal(true); // Show the confirmation modal
  };

  // Modal confirmation handler
  const handleConfirmDeletion = () => {
    setIsLoading(true); // Show loading spinner
    setTimeout(() => {
      setActiveItems((prev) => prev.filter((item) => item.id !== rowToDelete));
      setIsLoading(false); // Hide loading spinner
      setSuccess(true); // Set success message
      setRowToDelete(null); // Reset row to delete
    }, 2000); // Simulate loading time of 2 seconds
  };

  const handleCancelDeletion = () => {
    setShowModal(false); // Close modal without deleting
    setRowToDelete(null); // Reset row to delete
  };

  return (
    <div className={styles.managementContainer}>
      <p className={styles.sectionTitle}>Position Management</p>
      <div className={styles.managementContents}>
        <p>Add New</p>
        <div className={styles.addNewContainer}>
          <table className={styles.addTable}>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => handleChangeRow(row.id, e.target.value)}
                      placeholder="Add Position"
                    />
                  </td>
                  <td>
                    {index === 0 ? (
                      <button
                        className={styles.addRowButton}
                        onClick={handleAddRow}
                      >
                        Add Row
                      </button>
                    ) : (
                      <button onClick={() => handleRemoveRow(row.id)}>
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <path d="M1 1L9 9M1 9L9 1" stroke="black" strokeWidth="2" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.activeContainer}>
          <p>Active Positions</p>
          <div className={styles.activeList}>
            <div className={styles.scrollable}>
              <ul>
                {activeItems.map((item) => (
                  <li className={styles.entryItem} key={item.id}>
                    <div className={styles.entryCheckbox}>
                      <input
                        title="position"
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}}
                      />
                      <label>{item.name}</label>
                    </div>
                    <button
                      title="delete"
                      className={styles.deleteButton}
                      onClick={() => handleDeleteActiveItem(item.id)} // Trigger the delete action
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M1 1L9 9M1 9L9 1" stroke="black" strokeWidth="2" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.managementActionButtons}>
              <button title="save">Save</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Confirmation */}
      <Modal
        showModal={showModal} // Modal visibility state
        setShowModal={setShowModal} // Function to toggle the modal
        description={
          success
            ? "Position successfully deleted." // Success message after deletion
            : "Are you sure you want to delete this position?" // Default modal description
        }
        onConfirm={handleConfirmDeletion} // Confirm deletion function
        onCancel={handleCancelDeletion} // Cancel deletion function
        isLoading={isLoading} // Show loading spinner during deletion
      />
    </div>
  );
};

export default PositionManagement;
