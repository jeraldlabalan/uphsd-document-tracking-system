"use client";

import { useState, useEffect } from "react";
import styles from "./userManagement.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import {
  Search as SearchIcon,
  Users,
  UserX,
  PauseCircle,
  Activity,
  
} from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";

interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  sex: string;
  employeeId: string;
  department: string;
  position: string;
  role: string;
  status: "Active" | "Inactive" | "Terminated";
  dateCreated: string;
}

export default function UserManagement() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showTerminateSuccess, setShowTerminateSuccess] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  // New states for Deactivate modal & success
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeactivateSuccess, setShowDeactivateSuccess] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/user-management/users");
        const data = await res.json();

        if (Array.isArray(data)) {
          setUsers(data);
          setError(null);
        } else if (data && typeof data === "object" && "error" in data) {
          setError(data.error || "Unknown API error");
          setUsers([]);
        } else {
          setError("Unexpected API response");
          setUsers([]);
          console.error("API did not return an array:", data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Failed to fetch users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const statusMatch = !statusFilter || user.status === statusFilter;
    const searchLower = search.toLowerCase();

    const searchableFields = [
      user.id?.toString() ?? "",
      user.name?.toLowerCase?.() ?? "",
      user.email?.toLowerCase?.() ?? "",
      user.mobile?.toLowerCase?.() ?? "",
      user.sex?.toLowerCase?.() ?? "",
      user.employeeId?.toLowerCase?.() ?? "",
      user.department?.toLowerCase?.() ?? "",
      user.position?.toLowerCase?.() ?? "",
      user.role?.toLowerCase?.() ?? "",
    ];

    const searchMatch = searchableFields.some((field) =>
      field.includes(searchLower)
    );

    const userDate = new Date(user.dateCreated);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const dateMatch = (!from || userDate >= from) && (!to || userDate <= to);

    return statusMatch && searchMatch && dateMatch;
  });

  // Sort filteredUsers descending by id
  const sortedUsers = filteredUsers.slice().sort((a, b) => a.id - b.id);

  const handleReactivate = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/admin/user-management/reactivate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedUser.id ? { ...user, status: "Active" } : user
          )
        );
        setShowEditConfirm(false);
        setShowEditSuccess(true);
      } else {
        const data = await res.json();
        alert(`Failed to reactivate user: ${data.message}`);
      }
    } catch (err) {
      console.error("Reactivate Error:", err);
      alert("Something went wrong.");
    }
  };

  const handleTerminate = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/admin/user-management/terminate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id }),
      });

      const text = await res.text();
      let data = null;
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("Invalid JSON returned:", err);
        }
      }

      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedUser.id
              ? { ...user, status: "Terminated" }
              : user
          )
        );
        setShowTerminateConfirm(false);
        setShowTerminateSuccess(true);
      } else {
        alert(`Failed to terminate user: ${data?.message || res.statusText}`);
      }
    } catch (err) {
      console.error("Terminate Error:", err);
      alert("Something went wrong.");
    }
  };

  // New: handleDeactivate
  const handleDeactivate = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/admin/user-management/deactivate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id }),
      });

      const text = await res.text();
      let data = null;
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("Invalid JSON returned:", err);
        }
      }

      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedUser.id ? { ...user, status: "Inactive" } : user
          )
        );
        setShowDeactivateConfirm(false);
        setShowDeactivateSuccess(true);
      } else {
        alert(`Failed to deactivate user: ${data?.message || res.statusText}`);
      }
    } catch (err) {
      console.error("Deactivate Error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <AdminHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>User Management</h2>
            <Link href="./user-management/create-new-user">
              <button className={styles.createButton}>+ Create New User</button>
            </Link>
          </div>

          <hr className={styles.separator} />

          <div className={styles.summary}>
            <div className={`${styles.card} ${styles.cyan}`}>
              <Users className={styles.icon} />
              <span className={styles.count}>{users.length}</span>
              <span>Total User</span>
            </div>
            <div className={`${styles.card} ${styles.green}`}>
              <Activity className={styles.icon} />
              <span className={styles.count}>
                {users.filter((u) => u.status === "Active").length}
              </span>
              <span>Active User</span>
            </div>
            <div className={`${styles.card} ${styles.orange}`}>
              <PauseCircle className={styles.icon} />
              <span className={styles.count}>
                {users.filter((u) => u.status === "Inactive").length}
              </span>
              <span>Inactive User</span>
            </div>
            <div className={`${styles.card} ${styles.red}`}>
              <UserX className={styles.icon} />
              <span className={styles.count}>
                {users.filter((u) => u.status === "Terminated").length}
              </span>
              <span>Terminated User</span>
            </div>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search users..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className={styles.dropdown}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Terminated">Terminated</option>
            </select>

            <div className={styles.dateFilterWrapper}>
              <div className={styles.dateGroup}>
                <span className={styles.dateLabel}>From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    const newFrom = e.target.value;
                    setDateFrom(newFrom);

                    if (dateTo && newFrom > dateTo) {
                      setDateError(
                        '"From" date cannot be later than "To" date.'
                      );
                    } else {
                      setDateError("");
                    }
                  }}
                  className={styles.dateInput}
                />
                <span className={styles.dateLabel}>To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    const newTo = e.target.value;
                    setDateTo(newTo);

                    if (dateFrom && newTo < dateFrom) {
                      setDateError(
                        '"To" date cannot be earlier than "From" date.'
                      );
                    } else {
                      setDateError("");
                    }
                  }}
                  className={styles.dateInput}
                  min={dateFrom}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <p style={{ color: "red" }}>Error: {error}</p>
          ) : (
            <div className={styles.tableWrapper}>
            <table className={styles.docTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Date Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
  {sortedUsers.length === 0 ? (
    <tr>
  <td colSpan={12} className={styles.noUserRow}>
    <UserX className={styles.noUserIcon} />
    No user found
  </td>
</tr>


  ) : (
    sortedUsers.map((user, i) => (
      <tr key={i}>
        <td>{user.id}</td>
        <td>{user.name}</td>
        <td>{user.employeeId}</td>
        <td>{user.department}</td>
        <td>{user.position}</td>
        <td>{user.role}</td>
        <td>
          <span
            className={`${styles.badge} ${
              user.status === "Active"
                ? styles.active
                : user.status === "Terminated"
                  ? styles.terminated
                  : styles.pending
            }`}
          >
            {user.status}
          </span>
        </td>
        <td>{new Date(user.dateCreated).toLocaleDateString()}</td>
        <td>
          <>
            {user.status === "Active" && (
              <>
                <Link
                  href={`/admin/user-management/edit-user/${user.id}`}
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const [firstName, ...rest] = user.name.split(" ");
                      const lastName = rest.join(" ");
                      const userWithNames = { ...user, firstName, lastName };
                      localStorage.setItem(
                        "editUser",
                        JSON.stringify(userWithNames)
                      );
                    }
                  }}
                >
                  Edit
                </Link>{" "}
                <button
                  className={`${styles.actionBtn} ${styles.deactivateBtn}`}
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeactivateConfirm(true);
                  }}
                >
                  Deactivate
                </button>{" "}
                <button
                  className={`${styles.actionBtn} ${styles.terminateBtn}`}
                  onClick={() => {
                    setSelectedUser(user);
                    setShowTerminateConfirm(true);
                  }}
                >
                  Terminate
                </button>
              </>
            )}

            {(user.status === "Inactive" ||
              user.status === "Terminated") && (
              <button
                className={`${styles.actionBtn} ${styles.reactivateBtn}`}
                onClick={() => {
                  setSelectedUser(user);
                  setShowEditConfirm(true);
                }}
              >
                Reactivate
              </button>
            )}
          </>
        </td>
      </tr>
    ))
  )}
</tbody>

            </table>
            </div>
          )}
        </div>

        {/* Reactivate Modal */}
        {showEditConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.editmodalTitle}>Confirm Reactivation</h3>
              <p>
                Are you sure you want to reactivate{" "}
                <strong>{selectedUser?.name}</strong>?
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.reactivatecancelButton}
                  onClick={() => {
                    setShowEditConfirm(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={handleReactivate}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditSuccess && (
          <div className={styles.successmodalOverlay}>
            <div className={styles.modal}>
              <h3 className={styles.successmodalTitle}>Success!</h3>
              <p>
                <strong>{selectedUser?.name}</strong> has been successfully
                reactivated.
              </p>
              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowEditSuccess(false);
                    setSelectedUser(null);
                  }}
                  className={styles.closeButtonx}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Terminate Modal */}
        {showTerminateConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.terminatemodalTitle}>
                Confirm Termination
              </h3>
              <p>
                Are you sure you want to terminate{" "}
                <strong>{selectedUser?.name}</strong>?
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.terminatecancelButton}
                  onClick={() => {
                    setShowTerminateConfirm(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.terminateButton}
                  onClick={handleTerminate}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {showTerminateSuccess && (
          <div className={styles.successmodalOverlay}>
            <div className={styles.modal}>
              <h3 className={styles.successmodalTitle}>Terminated</h3>
              <p>
                <strong>{selectedUser?.name}</strong> has been successfully
                terminated.
              </p>
              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowTerminateSuccess(false);
                    setSelectedUser(null);
                  }}
                  className={styles.closeButtonx}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deactivate Modal */}
        {showDeactivateConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.deactivatemodalTitle}>
                Confirm Deactivation
              </h3>
              <p>
                Are you sure you want to deactivate{" "}
                <strong>{selectedUser?.name}</strong>?
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.deactivatecancelButton}
                  onClick={() => {
                    setShowDeactivateConfirm(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.deactivateButton}
                  onClick={handleDeactivate}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deactivate Success Modal */}
        {showDeactivateSuccess && (
          <div className={styles.successmodalOverlay}>
            <div className={styles.modal}>
              <h3 className={styles.successmodalTitle}>Deactivated</h3>
              <p>
                <strong>{selectedUser?.name}</strong> has been successfully
                deactivated.
              </p>
              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowDeactivateSuccess(false);
                    setSelectedUser(null);
                  }}
                  className={styles.closeButtonx}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
