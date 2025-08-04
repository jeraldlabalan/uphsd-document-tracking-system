// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import toast from "react-hot-toast";
// import styles from "./EditUser.module.css";

// interface Role {
//   RoleID: number;
//   RoleName: string;
// }
// interface Department {
//   DepartmentID: number;
//   Name: string;
// }
// interface Position {
//   PositionID: number;
//   Name: string;
// }
// interface User {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   password?: string;
//   mobileNumber: string;
//   sex: string;
//   roleID: number;
//   departmentID?: number | null;
//   positionID: number;
//   employeeID: string;
//   profilePicture?: string | null;
// }

// const emailRegex = /^[^\s@]+@cvsu\.edu\.ph$/i;
// const passwordRequirements = [
//   { label: "At least 8 characters", test: (s: string) => s.length >= 8 },
//   { label: "Uppercase letter", test: (s: string) => /[A-Z]/.test(s) },
//   { label: "Lowercase letter", test: (s: string) => /[a-z]/.test(s) },
//   { label: "Number", test: (s: string) => /\d/.test(s) },
//   {
//     label: "Special character (!@#$%^&*)",
//     test: (s: string) => /[!@#$%^&*]/.test(s),
//   },
// ];

// // Helper to convert +63 format to 09 format for display
// const toLocalMobileFormat = (mobile: string) => {
//   if (mobile.startsWith("+63")) {
//     return "0" + mobile.substring(3);
//   }
//   return mobile;
// };

// export default function EditUserPage() {
//   const router = useRouter();
//   const { id: userId } = useParams();
//   const [user, setUser] = useState<User | null>(null);
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [positions, setPositions] = useState<Position[]>([]);
//   const [errors, setErrors] = useState<{ [k: string]: string }>({});
//   const [success, setSuccess] = useState(false);

//   const fetchPositionsByRole = async (roleId: number) => {
//     if (!roleId) {
//       setPositions([]);
//       return;
//     }

//     try {
//       const res = await fetch(`/api/user/position?roleId=${roleId}`);
//       if (res.ok) {
//         const data = await res.json();
//         setPositions(Array.isArray(data) ? data : []);
//       } else {
//         setPositions([]);
//       }
//     } catch (error) {
//       console.error("Error fetching positions:", error);
//       setPositions([]);
//     }
//   };

//   useEffect(() => {
//     if (!userId) return router.push("/admin/user-management");

//     Promise.all([
//       fetch("/api/user/role"),
//       fetch("/api/user/department"),
//       fetch("/api/user/position"),
//       fetch(`/api/admin/user-management/users/${userId}`),
//     ])
//       .then(async ([rRoles, rDeps, rPositions, rUser]) => {
//         if (!rUser.ok) return router.push("/admin/user-management");

//         const [rolesData, depsData, positionsData, userData] =
//           await Promise.all([
//             rRoles.json(),
//             rDeps.json(),
//             rPositions.json(),
//             rUser.json(),
//           ]);

//         setRoles(Array.isArray(rolesData) ? rolesData : []);
//         setDepartments(
//           Array.isArray(depsData) ? depsData : depsData?.departments || []
//         );

//         setUser({
//           id: userData.id,
//           firstName: userData.firstName ?? "",
//           lastName: userData.lastName ?? "",
//           email: userData.email ?? "",
//           password: "",
//           // convert mobile to local format for input display
//           mobileNumber: toLocalMobileFormat(userData.mobile ?? ""),
//           sex: userData.sex ?? "Male",
//           roleID: userData.roleId ?? 0,
//           departmentID: userData.departmentId ?? null,
//           positionID: userData.positionId ?? 0,
//           employeeID: userData.employeeId ?? "",
//           profilePicture: userData.profilePicture ?? null,
//         });

//         fetchPositionsByRole(userData.roleId ?? 0);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch user data:", err);
//         router.push("/admin/user-management");
//       });
//   }, [userId, router]);

//   const validatePassword = (pw: string) =>
//     passwordRequirements.every((r) => r.test(pw));

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     if (!user) return;
//     const { name, value } = e.target;

//     if (name === "mobileNumber") {
//       const digits = value.replace(/\D/g, "").slice(0, 11);
//       setUser({ ...user, mobileNumber: digits });
//       const valid = /^09\d{9}$/.test(digits) || digits === "";
//       setErrors((p) => ({
//         ...p,
//         mobileNumber: valid ? "" : "Must be 11 digits starting with 09.",
//       }));
//       return;
//     }

//     if (name === "email") {
//       const valid = emailRegex.test(value);
//       setErrors((p) => ({
//         ...p,
//         email: valid ? "" : "Must be a valid @cvsu.edu.ph address",
//       }));
//     }

//     if (name === "roleID") {
//       const newRoleID = Number(value);
//       fetchPositionsByRole(newRoleID);
//       setUser({
//         ...user,
//         roleID: newRoleID,
//         positionID: 0,
//       });
//       return;
//     }

//     setUser({
//       ...user,
//       [name]: name.match(/ID$/) ? Number(value) : value,
//     });
//   };

//   const handleSubmit = async () => {
//     if (!user) return;

//     const errs: any = {};
//     if (!emailRegex.test(user.email)) errs.email = "Invalid email";
//     if (user.password && !validatePassword(user.password))
//       errs.password = "Password doesn't meet requirements";
//     if (user.mobileNumber && !/^09\d{9}$/.test(user.mobileNumber))
//       errs.mobileNumber = "Mobile invalid";

//     if (Object.keys(errs).length) {
//       setErrors(errs);
//       return;
//     }

//     // Convert mobile number to +63 format before sending
//     let mobileForDb = user.mobileNumber;
//     if (mobileForDb.startsWith("09")) {
//       mobileForDb = "+63" + mobileForDb.substring(1);
//     }

//     const payload: any = {
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       mobile: mobileForDb,
//       sex: user.sex,
//       roleId: user.roleID,
//       positionId: user.positionID,
//       employeeId: user.employeeID,
//       isActive: true,
//     };
//     if (user.password) payload.password = user.password;

//     const adminRoleId = roles.find(
//       (r) => r.RoleName.toLowerCase() === "admin"
//     )?.RoleID;
//     if (user.roleID !== adminRoleId) {
//       payload.departmentId = user.departmentID;
//     }

//     const res = await fetch(`/api/admin/user-management/users/${user.id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     if (res.ok) {
//       setSuccess(true);
//       toast.success("User updated successfully!");
//       setTimeout(() => router.push("/admin/user-management"), 1500);
//     } else {
//       toast.error("Update failed");
//     }
//   };

//   if (!user) return <p>Loading...</p>;

//   const adminRoleId = roles.find(
//     (r) => r.RoleName.toLowerCase() === "admin"
//   )?.RoleID;

//   const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`;

//   return (
//     <div className={styles.editContainer}>
//       <h2 className={styles.title}>Edit User</h2>

//       {/* Profile Section */}
//       <div className={styles.profileSection}>
//         <div className={styles.profileCenter}>
//           {user.profilePicture ? (
//             <img
//               src={user.profilePicture}
//               alt="Profile"
//               className={styles.profilePicture}
//             />
//           ) : (
//             <div className={styles.initialsFallback}>
//               {user.firstName?.slice(0, 1).toUpperCase() || ""}
//             </div>
//           )}
//           <div className={styles.nameContainer}>
//             <p className={styles.fullName}>{fullName}</p>
//           </div>
//         </div>
//       </div>

//       <form className={styles.form}>
//         {/* Employee ID */}
//         <div className={styles.formGroup}>
//           <label>Employee ID</label>
//           <input
//             name="employeeID"
//             type="text"
//             value={user.employeeID}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Firstname */}
//         <div className={styles.formGroup}>
//           <label>Firstname</label>
//           <input
//             name="firstName"
//             type="text"
//             value={user.firstName}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Lastname */}
//         <div className={styles.formGroup}>
//           <label>Lastname</label>
//           <input
//             name="lastName"
//             type="text"
//             value={user.lastName}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Email */}
//         <div className={styles.formGroup}>
//           <label>Email</label>
//           <input
//             name="email"
//             type="email"
//             value={user.email}
//             onChange={handleChange}
//           />
//           {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
//         </div>

//         {/* Password */}
//         <div className={styles.formGroup}>
//           <label>Password</label>
//           <input
//             name="password"
//             type="password"
//             value={user.password || ""}
//             onChange={handleChange}
//             placeholder="Enter new password"
//             autoComplete="new-password"
//           />
//           {user.password && (
//             <ul className={styles.passwordReqList}>
//               {passwordRequirements.map((req) => (
//                 <li
//                   key={req.label}
//                   style={{ color: req.test(user.password!) ? "green" : "gray" }}
//                 >
//                   {req.label}
//                 </li>
//               ))}
//             </ul>
//           )}
//           {errors.password && (
//             <p className={styles.errorMsg}>{errors.password}</p>
//           )}
//         </div>

//         {/* Mobile Number */}
//         <div className={styles.formGroup}>
//           <label>Mobile Number</label>
//           <input
//             name="mobileNumber"
//             type="text"
//             value={user.mobileNumber}
//             onChange={handleChange}
//           />
//           {errors.mobileNumber && (
//             <p className={styles.errorMsg}>{errors.mobileNumber}</p>
//           )}
//         </div>

//         {/* Sex */}
//         <div className={styles.formGroup}>
//           <label>Sex</label>
//           <select name="sex" value={user.sex} onChange={handleChange}>
//             <option>Male</option>
//             <option>Female</option>
//           </select>
//         </div>

//         {/* Role */}
//         <div className={styles.formGroup}>
//           <label>Role</label>
//           <select name="roleID" value={user.roleID} onChange={handleChange}>
//             <option value="" disabled hidden>
//               Select Role
//             </option>
//             {roles.map((r) => (
//               <option key={r.RoleID} value={r.RoleID}>
//                 {r.RoleName}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Department - only if not admin */}
//         {user.roleID !== adminRoleId && (
//           <div className={styles.formGroup}>
//             <label>Department</label>
//             <select
//               name="departmentID"
//               value={user.departmentID ?? ""}
//               onChange={handleChange}
//             >
//               <option value="" disabled hidden>
//                 Select Department
//               </option>
//               {departments.map((d) => (
//                 <option key={d.DepartmentID} value={d.DepartmentID}>
//                   {d.Name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* Position */}
//         <div className={styles.formGroup}>
//           <label>Position</label>
//           <select
//             name="positionID"
//             value={user.positionID}
//             onChange={handleChange}
//           >
//             <option value="" disabled hidden>
//               Select Position
//             </option>
//             {positions.map((p) => (
//               <option key={p.PositionID} value={p.PositionID}>
//                 {p.Name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button className={styles.saveBtn} type="button" onClick={handleSubmit}>
//           Save
//         </button>

//         {success && (
//           <p className={styles.successMsg}>User updated successfully!</p>
//         )}
//       </form>
//     </div>
//   );
// }








































"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./EditUser.module.css";

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
  if (mobile.startsWith("+63")) {
    return "0" + mobile.substring(3);
  }
  return mobile;
};

export default function EditUserPage() {
  const router = useRouter();
  const { id: userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const fetchPositionsByRole = async (roleId: number) => {
    if (!roleId) {
      setPositions([]);
      return;
    }

    try {
      const res = await fetch(`/api/user/position?roleId=${roleId}`);
      if (res.ok) {
        const data = await res.json();
        setPositions(Array.isArray(data) ? data : []);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      setPositions([]);
    }
  };

  useEffect(() => {
    if (!userId) return router.push("/admin/user-management");

    Promise.all([
      fetch("/api/user/role"),
      fetch("/api/user/department"),
      fetch("/api/user/position"),
      fetch(`/api/admin/user-management/users/${userId}`),
    ])
      .then(async ([rRoles, rDeps, rPositions, rUser]) => {
        if (!rUser.ok) return router.push("/admin/user-management");

        const [rolesData, depsData, positionsData, userData] =
          await Promise.all([
            rRoles.json(),
            rDeps.json(),
            rPositions.json(),
            rUser.json(),
          ]);

        setRoles(Array.isArray(rolesData) ? rolesData : []);
        setDepartments(
          Array.isArray(depsData) ? depsData : depsData?.departments || []
        );

        setUser({
          id: userData.id,
          firstName: userData.firstName ?? "",
          lastName: userData.lastName ?? "",
          email: userData.email ?? "",
          password: "",
          mobileNumber: toLocalMobileFormat(userData.mobile ?? ""),
          sex: userData.sex ?? "Male",
          roleID: userData.roleId ?? 0,
          departmentID: userData.departmentId ?? null,
          positionID: userData.positionId ?? 0,
          employeeID: userData.employeeId ?? "",
          profilePicture: userData.profilePicture ?? null,
        });

        fetchPositionsByRole(userData.roleId ?? 0);
      })
      .catch((err) => {
        console.error("Failed to fetch user data:", err);
        router.push("/admin/user-management");
      });
  }, [userId, router]);

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
      const valid = /^09\d{9}$/.test(digits) || digits === "";
      setErrors((p) => ({
        ...p,
        mobileNumber: valid ? "" : "Must be 11 digits starting with 09.",
      }));
      if (valid) {
        setErrors((p) => {
          const copy = { ...p };
          delete copy.mobileNumber;
          return copy;
        });
      }
      return;
    }

    if (name === "email") {
      const valid = emailRegex.test(value);
      setErrors((p) => ({
        ...p,
        email: valid ? "" : "Must be a valid @cvsu.edu.ph address",
      }));
      if (valid) {
        setErrors((p) => {
          const copy = { ...p };
          delete copy.email;
          return copy;
        });
      }
    }

    if (name === "roleID") {
      const newRoleID = Number(value);
      fetchPositionsByRole(newRoleID);
      setUser({
        ...user,
        roleID: newRoleID,
        positionID: 0,
      });
      // Clear department and position errors if any
      setErrors((p) => {
        const copy = { ...p };
        delete copy.departmentID;
        delete copy.positionID;
        return copy;
      });
      return;
    }

    // For firstName and lastName, clear errors on valid input
    if (name === "firstName") {
      if (value.trim() !== "") {
        setErrors((p) => {
          const copy = { ...p };
          delete copy.firstName;
          return copy;
        });
      }
    }

    if (name === "lastName") {
      if (value.trim() !== "") {
        setErrors((p) => {
          const copy = { ...p };
          delete copy.lastName;
          return copy;
        });
      }
    }

    if (name === "password") {
      if (value === "" || validatePassword(value)) {
        setErrors((p) => {
          const copy = { ...p };
          delete copy.password;
          return copy;
        });
      }
    }

    setUser({
      ...user,
      [name]: name.match(/ID$/) ? Number(value) : value,
    });
  };

  const handleSubmit = async () => {
    if (!user) return;

    const errs: any = {};
    if (!emailRegex.test(user.email)) errs.email = "Invalid email";

    // Both first and last names are required
    if (user.firstName.trim() === "") {
      errs.firstName = "First name is required";
    }
    if (user.lastName.trim() === "") {
      errs.lastName = "Last name is required";
    }

    if (user.password && !validatePassword(user.password))
      errs.password = "Password doesn't meet requirements";
    if (user.mobileNumber && !/^09\d{9}$/.test(user.mobileNumber))
      errs.mobileNumber = "Mobile invalid";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    let mobileForDb = user.mobileNumber;
    if (mobileForDb.startsWith("09")) {
      mobileForDb = "+63" + mobileForDb.substring(1);
    }

    const payload: any = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: mobileForDb,
      sex: user.sex,
      roleId: user.roleID,
      positionId: user.positionID,
      employeeId: user.employeeID,
      isActive: true,
    };
    if (user.password) payload.password = user.password;

    const adminRoleId = roles.find(
      (r) => r.RoleName.toLowerCase() === "admin"
    )?.RoleID;
    if (user.roleID !== adminRoleId) {
      payload.departmentId = user.departmentID;
    }

    const res = await fetch(`/api/admin/user-management/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("User updated successfully!");
      setTimeout(() => router.push("/admin/user-management"), 1500);
    } else {
      toast.error("Update failed");
    }
  };

  if (!user) return <p>Loading...</p>;

  const adminRoleId = roles.find(
    (r) => r.RoleName.toLowerCase() === "admin"
  )?.RoleID;

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`;

  return (
    <div className={styles.editContainer}>
      <h2 className={styles.title}>Edit User</h2>

      <div className={styles.profileSection}>
        <div className={styles.profileCenter}>
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className={styles.profilePicture}
            />
          ) : (
            <div className={styles.initialsFallback}>
              {user.firstName?.slice(0, 1).toUpperCase() || ""}
            </div>
          )}
          <div className={styles.nameContainer}>
            <p className={styles.fullName}>{fullName}</p>
          </div>
        </div>
      </div>

      <form className={styles.form}>
        <div className={styles.formGroup}>
          <label>Employee ID</label>
          <input
            name="employeeID"
            type="text"
            value={user.employeeID}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Firstname</label>
          <input
            name="firstName"
            type="text"
            value={user.firstName}
            onChange={handleChange}
          />
          {errors.firstName && (
            <p className={styles.errorMsg}>{errors.firstName}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Lastname</label>
          <input
            name="lastName"
            type="text"
            value={user.lastName}
            onChange={handleChange}
          />
          {errors.lastName && (
            <p className={styles.errorMsg}>{errors.lastName}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={user.email}
            onChange={handleChange}
          />
          {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={user.password || ""}
            onChange={handleChange}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
          {user.password && (
            <ul className={styles.passwordReqList}>
              {passwordRequirements.map((req) => (
                <li
                  key={req.label}
                  style={{ color: req.test(user.password!) ? "green" : "gray" }}
                >
                  {req.label}
                </li>
              ))}
            </ul>
          )}
          {errors.password && (
            <p className={styles.errorMsg}>{errors.password}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Mobile Number</label>
          <input
            name="mobileNumber"
            type="text"
            value={user.mobileNumber}
            onChange={handleChange}
          />
          {errors.mobileNumber && (
            <p className={styles.errorMsg}>{errors.mobileNumber}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Sex</label>
          <select name="sex" value={user.sex} onChange={handleChange}>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Role</label>
          <select name="roleID" value={user.roleID} onChange={handleChange}>
            <option value="" disabled hidden>
              Select Role
            </option>
            {roles.map((r) => (
              <option key={r.RoleID} value={r.RoleID}>
                {r.RoleName}
              </option>
            ))}
          </select>
        </div>

        {user.roleID !== adminRoleId && (
          <div className={styles.formGroup}>
            <label>Department</label>
            <select
              name="departmentID"
              value={user.departmentID ?? ""}
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                Select Department
              </option>
              {departments.map((d) => (
                <option key={d.DepartmentID} value={d.DepartmentID}>
                  {d.Name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Position</label>
          <select
            name="positionID"
            value={user.positionID}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Select Position
            </option>
            {positions.map((p) => (
              <option key={p.PositionID} value={p.PositionID}>
                {p.Name}
              </option>
            ))}
          </select>
        </div>

        <button className={styles.saveBtn} type="button" onClick={handleSubmit}>
          Save
        </button>
      </form>
    </div>
  );
}
