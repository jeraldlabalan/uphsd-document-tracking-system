"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import styles from "./ManagementStyles.module.css";

interface InputRow {
  id: number;
  value: string;
}

interface ActiveItem {
  id: number;
  name: string;
  checked: boolean;
}

interface DepartmentManagementProps {
  showModal: (data: {
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
  }) => void;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ showModal }) => {
  const [rows, setRows] = useState<InputRow[]>([{ id: Date.now(), value: "" }]);
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([]);

  const [rowToDelete, setRowToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmAdd, setConfirmAdd] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/settings/department-management");
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setActiveItems(
        data.map((dept: any) => ({
          id: dept.DepartmentID,
          name: dept.Name,
          checked: true,
        }))
      );
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load departments.");
    }
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: Date.now(), value: "" }]);
  };

  const handleChangeRow = (id: number, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  };

  const handleRemoveRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const hasDuplicates = (): boolean => {
    const newValues = rows
      .map((r) => r.value.trim().toLowerCase())
      .filter((val) => val !== "");
    const activeNames = activeItems.map((item) => item.name.toLowerCase());
    return newValues.some((val) => activeNames.includes(val));
  };

  const handleSaveClick = () => {
    const validRows = rows.filter((r) => r.value.trim() !== "");

    if (rows.some((r) => r.value.trim() === "")) {
      toast.error("Please fill out all department fields before saving.");
      return;
    }

    if (validRows.length === 0) return;

    if (hasDuplicates()) {
      toast.error("One or more departments already exist and cannot be added.");
      return;
    }

    setConfirmAdd(true);
    showModal({
      description: "Are you sure you want to add these departments?",
      onConfirm: handleConfirm,
      onCancel: handleCancel,
      isLoading: isLoading,
    });
  };

  const handleConfirm = async () => {
    if (confirmAdd) {
      await saveDepartments();
    } else {
      await handleConfirmDeletion();
    }
  };

  const saveDepartments = async () => {
    const validRows = rows.filter((r) => r.value.trim() !== "");
    if (validRows.length === 0) {
      showModal({
        description: "Department successfully deleted.",
        onConfirm: handleCancel,
        onCancel: handleCancel,
        isLoading: false,
      });
      setConfirmAdd(false);
      return;
    }
    setIsLoading(true);
    setSuccess(false);

    try {
      for (const row of validRows) {
        const res = await fetch("/api/admin/settings/department-management", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: row.value.trim() }),
        });
        if (!res.ok) {
          throw new Error("Failed to add department");
        }
      }

      await fetchDepartments();

      setRows([{ id: Date.now(), value: "" }]);
      setSuccess(true);
      toast.success("Departments added successfully!");
    } catch (error) {
      console.error("Error saving departments:", error);
      toast.error("Error saving departments.");
    } finally {
      setIsLoading(false);
      showModal({
        description: "Department successfully deleted.",
        onConfirm: handleCancel,
        onCancel: handleCancel,
        isLoading: false,
      });
      setConfirmAdd(false);
    }
  };

  const handleDeleteActiveItem = (id: number) => {
    setSuccess(false);
    setRowToDelete(id);
    setConfirmAdd(false);
    showModal({
      description: "Are you sure you want to delete this department?",
      onConfirm: handleConfirmDeletion,
      onCancel: handleCancel,
      isLoading: isLoading,
    });
  };

  const handleConfirmDeletion = async () => {
    if (rowToDelete === null) return;
    setIsLoading(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/settings/department-management", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rowToDelete }),
      });
      if (res.ok) {
        setActiveItems((prev) =>
          prev.filter((item) => item.id !== rowToDelete)
        );
        setSuccess(true);
        toast.success("Department successfully deleted.");
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting department.");
    } finally {
      setIsLoading(false);
      setRowToDelete(null);
      showModal({
        description: "Department successfully deleted.",
        onConfirm: handleCancel,
        onCancel: handleCancel,
        isLoading: false,
      });
    }
  };

  const handleCancel = () => {
    showModal({
      description: "Department successfully deleted.",
      onConfirm: handleCancel,
      onCancel: handleCancel,
      isLoading: false,
    });
  };

  return (
    <div className={styles.managementContainer}>
      <p className={styles.sectionTitle}>Department Management</p>
      <div className={styles.managementContents}>
        <p>Add new department(s)</p>
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
                      placeholder="Add Department"
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
          <p>Active Departments</p>
          <div className={styles.activeList}>
            <div className={styles.scrollable}>
              <ul>
                {activeItems.length > 0 ? (
                  activeItems.map((item) => (
                    <li className={styles.entryItem} key={item.id}>
                      <div className={styles.entryCheckbox}>
                        <input
                          title="department"
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
                  <li key="no-active">No active departments found.</li>
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

export default DepartmentManagement;
