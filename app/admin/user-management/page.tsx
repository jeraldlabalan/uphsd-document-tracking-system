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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showTerminateSuccess, setShowTerminateSuccess] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/user-management/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    // Filter by status if selected
    const statusMatch = !statusFilter || user.status === statusFilter;

    // Lowercase search string for case-insensitive search
    const searchLower = search.toLowerCase();

    // Check if any searchable field contains the search text
    const searchableFields = [
      user.id.toString(),
      user.name.toLowerCase(),
      user.email.toLowerCase(),
      user.mobile.toLowerCase(),
      user.sex.toLowerCase(),
      user.employeeId.toLowerCase(),
      user.department.toLowerCase(),
      user.position.toLowerCase(),
      user.role.toLowerCase(),
    ];

    const searchMatch = searchableFields.some((field) =>
      field.includes(searchLower)
    );

    // Filter by date range if set
    const userDate = new Date(user.dateCreated);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const dateMatch = (!from || userDate >= from) && (!to || userDate <= to);

    return statusMatch && searchMatch && dateMatch;
  });

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
            <div className={`${styles.card} ${styles.orange}`}>
              <Users className={styles.icon} />
              <span className={styles.count}>{users.length}</span>
              <span>Total User</span>
            </div>
            <div className={`${styles.card} ${styles.cyan}`}>
              <Activity className={styles.icon} />
              <span className={styles.count}>
                {users.filter((u) => u.status === "Active").length}
              </span>
              <span>Active User</span>
            </div>
            <div className={`${styles.card} ${styles.green}`}>
              <PauseCircle className={styles.icon} />
              <span className={styles.count}>
                {users.filter((u) => u.status === "Inactive").length}
              </span>
              <span>Inactive User</span>
            </div>
            <div className={`${styles.card} ${styles.yellow}`}>
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
                placeholder="Search"
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
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.dateGroup}>
                <span className={styles.dateLabel}>To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table className={styles.docTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Sex</th>
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
                {filteredUsers.map((user, i) => (
                  <tr key={i}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.mobile}</td>
                    <td>{user.sex}</td>
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
                      {/* No action buttons if user is terminated */}
                      {user.status !== "Terminated" && (
                        <>
                          <Link
                            href="/admin/user-management/edit-user"
                            className={styles.actionBtn}
                          >
                            Edit
                          </Link>
                          {user.status === "Active" && (
                            <button
                              className={styles.actionBtn}
                              onClick={() => {
                                setSelectedUser(user);
                                setShowTerminateConfirm(true);
                              }}
                            >
                              Terminate
                            </button>
                          )}
                          {user.status === "Inactive" && (
                            <button
                              className={styles.actionBtn}
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditConfirm(true);
                              }}
                            >
                              Reactivate
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modals */}
        {showEditConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.editmodalTitle}>Confirm Reactivation</h3>
              <p>Are you sure you want to reactivate this account?</p>
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
                  onClick={() => {
                    setShowEditConfirm(false);
                    setShowEditSuccess(true);
                  }}
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
              <p>{selectedUser?.name} has been successfully reactivated.</p>
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

        {showTerminateConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.terminatemodalTitle}>
                Confirm Termination
              </h3>
              <p>Are you sure you want to terminate this account?</p>
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
                  onClick={() => {
                    setShowTerminateConfirm(false);
                    setShowTerminateSuccess(true);
                  }}
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
              <p>{selectedUser?.name} has been successfully terminated.</p>
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
      </div>
    </div>
  );
}
