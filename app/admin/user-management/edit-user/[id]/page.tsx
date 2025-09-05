"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./EditUser.module.css";
import AdminHeader from "@/components/shared/adminHeader";
import Loading from "@/app/loading";

interface Role {
  RoleID: number;
  RoleName: string;
}
interface Department {
  DepartmentID: number;
  Name: string;
}
interface Position {
  PositionID: number;
  Name: string;
}
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  mobileNumber: string;
  sex: string;
  roleID: number;
  departmentID?: number | null;
  positionID: number;
  employeeID: string;
  profilePicture?: string | null;
}

interface UserUpdatePayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  mobile: string;
  sex: string;
  roleId: number;
  positionId: number;
  departmentId: number | null;
  employeeId: string;
}

const emailRegex = /^[^\s@]+@cvsu\.edu\.ph$/i;
const passwordRequirements = [
  { label: "At least 8 characters", test: (s: string) => s.length >= 8 },
  { label: "Uppercase letter", test: (s: string) => /[A-Z]/.test(s) },
  { label: "Lowercase letter", test: (s: string) => /[a-z]/.test(s) },
  { label: "Number", test: (s: string) => /\d/.test(s) },
  {
    label: "Special character (!@#$%^&*)",
    test: (s: string) => /[!@#$%^&*]/.test(s),
  },
];

const toLocalMobileFormat = (mobile: string) => {
  if (!mobile) return "";
  if (mobile.startsWith("+63")) return "0" + mobile.slice(3);
  return mobile;
};

// Helper to check if role is Admin
const isAdminRole = (roleId: number, roles: Role[]) => {
  const role = roles.find((r) => r.RoleID === roleId);
  return role?.RoleName.trim().toLowerCase() === "admin";
};

export default function EditUserPage() {
  const router = useRouter();
  const { id: userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showConfirm, setShowConfirm] = useState(false);


  const fetchPositionsByRole = async (roleId: number) => {
    const res = await fetch(`/api/user/position?roleId=${roleId}`);
    const data = await res.json();
    setPositions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!userId) {
      router.push("/admin/user-management");
      return;
    }

    Promise.all([
      fetch("/api/user/role"),
      fetch("/api/user/department"),
      fetch("/api/user/position"),
      fetch(`/api/admin/user-management/users/${userId}`),
    ]).then(async ([rRoles, rDeps, rPos, rUser]) => {
      if (!rUser.ok) {
        router.push("/admin/user-management");
        return;
      }
      const [rolesData, depsData, posData, userData] = await Promise.all([
        rRoles.json(),
        rDeps.json(),
        rPos.json(),
        rUser.json(),
      ]);

      setRoles(rolesData || []);
      setDepartments(depsData?.departments || depsData || []);
      setPositions(posData || []);
      setUser({
        id: userData.id,
        firstName: userData.firstName ?? "",
        lastName: userData.lastName ?? "",
        email: userData.email ?? "",
        password: "",
        mobileNumber: toLocalMobileFormat(userData.mobile ?? ""),
        sex: userData.sex ?? "",
        roleID: userData.roleId ?? 0,
        departmentID: userData.departmentId ?? null,
        positionID: userData.positionId ?? 0,
        employeeID: userData.employeeId ?? "",
        profilePicture: userData.profilePicture ?? null,
      });

      fetchPositionsByRole(userData.roleId);
    });
  }, [userId]);

  const validatePassword = (pw: string) =>
    passwordRequirements.every((r) => r.test(pw));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!user) return;

    const { name, value } = e.target;

    if (name === "mobileNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      setUser({ ...user, mobileNumber: digits });
      setErrors((prev) => ({
        ...prev,
        mobileNumber: /^09\d{9}$/.test(digits)
          ? ""
          : "Must be 11 digits starting with 09",
      }));
      return;
    }

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: emailRegex.test(value) ? "" : "Invalid email format",
      }));
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: !value || validatePassword(value) ? "" : "Invalid password",
      }));
    }

    if (name === "roleID") {
      const newRoleId = Number(value);
      fetchPositionsByRole(newRoleId);

      const admin = isAdminRole(newRoleId, roles);

      // Check if the current position is still valid for the new role
      const currentPositionValid = positions.some(
        (pos) => pos.PositionID === user.positionID
      );

      setUser({
        ...user,
        roleID: newRoleId,
        positionID: currentPositionValid ? user.positionID : 0, // Retain position if valid, else reset to default
        departmentID: admin ? null : user.departmentID,
      });
      return;
    }

    setUser({
      ...user,
      [name]:
        name === "employeeID"
          ? value
          : name.match(/ID$/)
            ? Number(value)
            : value,
    });

    // Clear EmployeeID error when user types
    if (name === "employeeID") {
      setErrors((prev) => ({
        ...prev,
        employeeID: "",
      }));
    }

    // Validation logic for firstName and lastName:
    if (name === "firstName" || name === "lastName") {
      if (!user.firstName && !user.lastName) {
        setErrors((prev) => ({
          ...prev,
          firstName: "Either Firstname or Lastname must be provided",
          lastName: "Either Firstname or Lastname must be provided",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          firstName: "",
          lastName: "",
        }));
      }
    }
  };

  const handleSubmitClick = () => {
  if (!user) return;

  const errs: { [key: string]: string } = {};
  if (!emailRegex.test(user.email)) errs.email = "Invalid email";
  if (!user.firstName && !user.lastName) {
    errs.firstName = "Either Firstname or Lastname must be provided";
    errs.lastName = "Either Firstname or Lastname must be provided";
  }
  if (!user.firstName) errs.firstName = "Required";
  if (!user.lastName) errs.lastName = "Required";
  if (user.password && !validatePassword(user.password))
    errs.password = "Weak password";
  if (!/^09\d{9}$/.test(user.mobileNumber))
    errs.mobileNumber = "Invalid number";
  
  // Validate EmployeeID is not empty
  if (!user.employeeID || user.employeeID.trim() === "") {
    errs.employeeID = "Employee ID is required";
  }

  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  // ✅ Instead of window.confirm, open modal
  setShowConfirm(true);
};

const confirmSubmit = async () => {
  if (!user) return;

  const payload: UserUpdatePayload = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.password || undefined,
    mobile: user.mobileNumber.replace(/^0/, "+63"),
    sex: user.sex,
    roleId: user.roleID,
    positionId: user.positionID,
    departmentId: isAdminRole(user.roleID, roles)
      ? null
      : (user.departmentID ?? null),
    employeeId: user.employeeID,
  };

  const res = await fetch(`/api/admin/user-management/users/${user.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    toast.success("User updated!");
    router.push("/admin/user-management");
  } else {
    try {
      const errorData = await res.json();
      toast.error(errorData.message || "Failed to update user");
    } catch {
      toast.error("Failed to update user");
    }
  }
};


  if (!user)
    return (
      <Loading/>
    );

  return (
    <div className={styles.container}>
      <AdminHeader />
      <div className={styles.contentContainer}>
        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Edit User</h2>
          <hr className={styles.separator} />

          <div className={styles.profileContainer}>
          <div className={styles.profileBox}>
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.fallbackInitials}>
                {user.firstName?.[0] ?? "?"}
              </div>
            )}
            <p className={styles.userName}>
              {user.firstName} {user.lastName}
            </p>
          </div>
          </div>

          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Employee ID</label>
              <input
                className={styles.input}
                name="employeeID"
                value={user.employeeID}
                onChange={handleChange}
              />
              {errors.employeeID && (
                <p className={styles.error}>{errors.employeeID}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Firstname</label>
              <input
                className={styles.input}
                name="firstName"
                value={user.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className={styles.error}>{errors.firstName}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Lastname</label>
              <input
                className={styles.input}
                name="lastName"
                value={user.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className={styles.error}>{errors.lastName}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                name="email"
                value={user.email}
                readOnly
              />
              {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                name="password"
                type="password"
                value={user.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
              />
              {user.password && (
                <div className={styles.passwordGuidance}>
                  {passwordRequirements.map((req, index) => {
                    const isValid = req.test(user.password || "");
                    return (
                      <div
                        key={index}
                        className={`${styles.passwordRequirement} ${
                          isValid ? styles.valid : ""
                        }`}
                      >
                        {isValid ? "✅" : "❌"} {req.label}
                      </div>
                    );
                  })}
                </div>
              )}

              {touched.password &&
                errors.password &&
                !validatePassword(user.password || "") && (
                  <p className={styles.error}>{errors.password}</p>
                )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Mobile</label>
              <input
                className={styles.input}
                name="mobileNumber"
                value={user.mobileNumber}
                onChange={handleChange}
              />
              {errors.mobileNumber && (
                <p className={styles.error}>{errors.mobileNumber}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Sex</label>
              <select
                className={styles.input}
                name="sex"
                value={user.sex}
                onChange={handleChange}
              >
                <option value="" disabled hidden>
                  Select Sex
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Role</label>
              <select
                className={styles.input}
                name="roleID"
                value={user.roleID}
                onChange={handleChange}
              >
                <option value="" disabled hidden>
                  Select Role
                </option>
                {roles.map((role) => (
                  <option key={role.RoleID} value={role.RoleID}>
                    {role.RoleName}
                  </option>
                ))}
              </select>
            </div>

            {/* Department dropdown only if NOT Admin */}
            {!isAdminRole(user.roleID, roles) && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Department</label>
                <select
                  className={styles.input}
                  name="departmentID"
                  value={user.departmentID ?? ""}
                  onChange={handleChange}
                >
                  <option value="" disabled hidden>
                    Select Department
                  </option>
                  {departments.map((dep) => (
                    <option key={dep.DepartmentID} value={dep.DepartmentID}>
                      {dep.Name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Position</label>
              <select
                className={styles.input}
                name="positionID"
                value={user.positionID || ""}
                onChange={handleChange}
              >
                <option value="" disabled hidden>
                  Select Position
                </option>
                {positions.map((pos) => (
                  <option key={pos.PositionID} value={pos.PositionID}>
                    {pos.Name}
                  </option>
                ))}
              </select>
            </div>

            <button
  className={styles.submitBtn}
  onClick={handleSubmitClick}
  disabled={Object.values(errors).some(Boolean)}
>
  Save Changes
</button>

          </div>
        </div>
      </div>
      {showConfirm && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalCard}>
      <h3 className={styles.modalTitle}>Confirm Changes</h3>
      <p className={styles.modalMessage}>
        Are you sure you want to save these changes?
      </p>
      <div className={styles.modalActions}>
        <button
          className={styles.cancelBtn}
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </button>
        <button
          className={styles.confirmBtn}
          onClick={() => {
            setShowConfirm(false);
            confirmSubmit();
          }}
        >
          Yes, Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
