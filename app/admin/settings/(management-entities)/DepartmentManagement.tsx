"use client";
import React, { useState } from "react";
import styles from "./ManagementStyles.module.css";

interface InputRow {
  id: string | number;
  value: string;
}

interface ActiveItem {
  id: string | number;
  name: string;
  checked: boolean;
}

const DepartmentManagement: React.FC = () => {
  const [rows, setRows] = useState<InputRow[]>([{ id: 1, value: "" }]);
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([
    { id: 10, name: "Human Resources", checked: true },
    { id: 11, name: "Information Technology", checked: true },
  ]);

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: Date.now(), value: "" }]);
  };

  const handleChangeRow = (id: number | string, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  };

  const handleRemoveRow = (id: number | string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleActiveItem = (id: number | string) => {
    setActiveItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDeleteActiveItem = (id: number | string) => {
    setActiveItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={styles.managementContainer}>

      <p className={styles.sectionTitle}>department management</p>

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
                    />
                  </td>
                  <td>
                    {index === 0 ? (
                      <button
                        type="button"
                        className={styles.addRowButton}
                        onClick={handleAddRow}
                      >
                        add row
                      </button>
                    ) : (
                      <button
                        title="delete-row"
                        onClick={() => handleRemoveRow(row.id)}
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
          <p>active departments</p>

          <div className={styles.activeList}>
            <div className={styles.scrollable}>
              <ul>
                {activeItems.map((item) => (
                  <li className={styles.entryItem} key={item.id}>
                    <div className={styles.entryCheckbox}>
                      <input
                        title="department"
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleActiveItem(item.id)}
                      />
                      <label>{item.name}</label>
                    </div>
                    <button
                      type="button"
                      title="delete"
                      className={styles.deleteButton}
                      onClick={() => handleDeleteActiveItem(item.id)}
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
                ))}
              </ul>
            </div>

            <div className={styles.managementActionButtons}>
              <button>save</button>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DepartmentManagement;
