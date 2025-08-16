"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import styles from "./ManagementStyles.module.css";

interface InputRow {
  id: string | number;
  value: string;
}

interface ActiveItem {
  id: number;
  name: string;
  checked: boolean;
}

interface PositionDTO {
  PositionID: number;
  Name: string;
}

interface PositionManagementProps {
  showModal: (data: {
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
  }) => void;
}

const PositionManagement: React.FC<PositionManagementProps> = ({
  showModal,
}) => {
  const [rows, setRows] = useState<InputRow[]>([{ id: Date.now(), value: "" }]);
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([]);

  const [rowToDelete, setRowToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const res = await fetch("/api/admin/settings/position-management");
      if (!res.ok) throw new Error("Failed to fetch positions");
      const data: PositionDTO[] = await res.json();
      setActiveItems(
        data.map((pos: PositionDTO) => ({
          id: pos.PositionID,
          name: pos.Name,
          checked: true,
        }))
      );
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: Date.now(), value: "" }]);
  };

  const handleChangeRow = (id: number | string, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  };

  const handleRemoveRow = (id: number | string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const hasDuplicates = (): boolean => {
    const trimmedNewValues = rows
      .map((r) => r.value.trim().toLowerCase())
      .filter((val) => val !== "");
    const activeNames = activeItems.map((item) => item.name.toLowerCase());

    return trimmedNewValues.some((val) => activeNames.includes(val));
  };

  const handleSaveClick = () => {
    const validRows = rows.filter((r) => r.value.trim() !== "");

    if (rows.some((r) => r.value.trim() === "")) {
      toast.error("Please complete all Position fields before saving.");
      return;
    }

    if (validRows.length === 0) {
      toast.error("Please complete all Position fields before saving.");
      return;
    }

    if (hasDuplicates()) {
      toast.error("One or more positions already exist and cannot be added.");
      return;
    }

    console.log("[PositionManagement Debug] handleSaveClick - calling showModal for add operation");
    showModal({
      description: "Are you sure you want to add these positions?",
      onConfirm: () => handleConfirmAdd(),
      onCancel: handleCancel,
      isLoading: false,
    });
  };

  const handleConfirmAdd = async () => {
    console.log("[PositionManagement Debug] handleConfirmAdd called");
    await savePositions();
  };

  const savePositions = async () => {
    const validRows = rows.filter((r) => r.value.trim() !== "");
    if (validRows.length === 0) {
      toast.success("No changes to save.");
      return;
    }
    setIsLoading(true);
    setSuccess(false);

    try {
      for (const row of validRows) {
        const res = await fetch("/api/admin/settings/position-management", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: row.value.trim() }),
        });
        if (!res.ok) {
          throw new Error("Failed to add position");
        }
      }

      // Fetch updated positions list after save
      await fetchPositions();

      setRows([{ id: Date.now(), value: "" }]);
      setSuccess(true);
      toast.success("Positions added successfully!");
    } catch (error) {
      console.error("Error saving rows:", error);
      toast.error("Error saving positions.");
    } finally {
      setIsLoading(false);
      // Close modal after action completes
      if (typeof window !== "undefined") {
        const event = new CustomEvent("closeModal");
        window.dispatchEvent(event);
      }
    }
  };

  const handleDeleteActiveItem = (id: number) => {
    console.log("[PositionManagement Debug] handleDeleteActiveItem - calling showModal for delete operation", { id });
    setSuccess(false);
    setRowToDelete(id);
    showModal({
      description: "Are you sure you want to delete this position?",
      onConfirm: () => handleConfirmDelete(id),
      onCancel: handleCancel,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async (id: number) => {
    console.log("[PositionManagement Debug] handleConfirmDelete called for ID:", id);
    setIsLoading(true);
    setSuccess(false);
    
    try {
      console.log("[PositionManagement Debug] Making DELETE request for ID:", id);
      const res = await fetch("/api/admin/settings/position-management", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      });
      
      console.log("[PositionManagement Debug] DELETE response status:", res.status);
      
      if (res.ok) {
        console.log("[PositionManagement Debug] Delete successful, updating UI");
        setActiveItems((prev) =>
          prev.filter((item) => item.id !== id)
        );
        setSuccess(true);
        toast.success("Position successfully deleted.");
        
        // Close modal after successful deletion
        if (typeof window !== "undefined") {
          const event = new CustomEvent("closeModal");
          window.dispatchEvent(event);
        }
      } else {
        console.log("[PositionManagement Debug] Delete failed with status:", res.status);
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting position.");
    } finally {
      setIsLoading(false);
      setRowToDelete(null);
    }
  };

  const handleCancel = () => {};

  return (
    <div className={styles.managementContainer}>
      <p className={styles.sectionTitle}>Position Management</p>
      <div className={styles.managementContents}>
        <p>Add new position(s)</p>
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
                      disabled={isLoading}
                      required
                    />
                  </td>
                  <td>
                    {index === 0 ? (
                      <button
                        className={styles.addRowButton}
                        onClick={handleAddRow}
                        disabled={isLoading}
                      >
                        Add Row
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={isLoading}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <path
                            d="M1 1L9 9M1 9L9 1"
                            stroke="black"
                            strokeWidth="2"
                          />
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
                {activeItems.length > 0 ? (
                  activeItems.map((item) => (
                    <li className={styles.entryItem} key={item.id}>
                      <div className={styles.entryCheckbox}>
                        <input
                          title="position"
                          type="checkbox"
                          checked={item.checked}
                          readOnly
                        />
                        <label>{item.name}</label>
                      </div>
                      <button
                        title="delete"
                        className={styles.deleteButton}
                        onClick={() => handleDeleteActiveItem(item.id)}
                        disabled={isLoading}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <path
                            d="M1 1L9 9M1 9L9 1"
                            stroke="black"
                            strokeWidth="2"
                          />
                        </svg>
                      </button>
                    </li>
                  ))
                ) : (
                  <li key="no-active">No active positions found.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.managementActionButtons}>
        <button
          title="save"
          onClick={handleSaveClick}
          disabled={isLoading || rows.every((r) => r.value.trim() === "")}
          className={styles.addRowButton}
          style={{ marginTop: 12 }}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Modal is now handled by the parent page */}
    </div>
  );
};

export default PositionManagement;
