// "use client";
// import React, { useState } from "react";
// import styles from "./ProfileManagement.module.css"; // change to your CSS module filename
// import CustomSelect from "@/components/custom-select/CustomSelect";

// /** Define the shape of our form data fields */
// interface FormData {
//   fname: string;
//   lname: string;
//   email: string;
//   employeeId: string;
//   contact: string;
//   role: string;
// }

// /** Strict typing for dropdown options */
// const departmentOptions: string[] = [
//   "Human Resources",
//   "Information Technology",
//   "Business",
//   "Marketing",
// ];

// const InformationForm: React.FC = () => {
//   /** State for standard input fields */
//   const [formData, setFormData] = useState<FormData>({
//     fname: "",
//     lname: "",
//     email: "",
//     employeeId: "",
//     contact: "",
//     role: "",
//   });

//   /** State for handling dropdown selection */
//   const [selectedDepartment, setSelectedDepartment] = useState<string | null>("Select")

//   /** Handles onChange for standard input fields */
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ): void => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   /** Reset states to clear the form */
//   const handleCancel = (): void => {
//     setFormData({
//       fname: "",
//       lname: "",
//       email: "",
//       employeeId: "",
//       contact: "",
//       role: "",
//     });
//     setSelectedDepartment(null);
//   };

//   /** Demo save logic — replace with API request later */
//   const handleSave = (): void => {
//     console.log({
//       ...formData,
//       department: selectedDepartment,
//     });
//   };

//   return (
//     <div className={styles.informationContainer}>
//       <p>information</p>

//       <form action="" method="" className={styles.informationForm}>
//         <div className={styles.formContainer}>
//           {/* FIRST NAME */}
//           <div className={styles.formData}>
//             <label htmlFor="fname">first name</label>
//             <input
//               name="fname"
//               placeholder="First Name"
//               type="text"
//               value={formData.fname}
//               onChange={handleChange}
//             />
//           </div>

//           {/* LAST NAME */}
//           <div className={styles.formData}>
//             <label htmlFor="lname">last name</label>
//             <input
//               name="lname"
//               placeholder="Last Name"
//               type="text"
//               value={formData.lname}
//               onChange={handleChange}
//             />
//           </div>

//           {/* EMAIL */}
//           <div className={styles.formData}>
//             <label>email address</label>
//             <input
//               name="email"
//               placeholder="email address"
//               type="text"
//               value={formData.email}
//               onChange={handleChange}
//             />
//           </div>

//           {/* EMPLOYEE ID */}
//           <div className={styles.formData}>
//             <label>employee id</label>
//             <input
//               name="employeeId"
//               placeholder="employee id"
//               type="text"
//               value={formData.employeeId}
//               onChange={handleChange}
//             />
//           </div>

//           {/* CONTACT */}
//           <div className={styles.formData}>
//             <label htmlFor="contact">mobile number</label>
//             <input
//               name="contact"
//               placeholder="contact number"
//               type="text"
//               value={formData.contact}
//               onChange={handleChange}
//             />
//           </div>

//           {/* ROLE */}
//           <div className={styles.formData}>
//             <label>role</label>
//             <input
//               name="role"
//               placeholder="role"
//               type="text"
//               value={formData.role}
//               onChange={handleChange}
//             />
//           </div>

//           {/* DROPDOWN (Department) */}
//           <div className={styles.formData}>
//             <label>department</label>
//             <CustomSelect options={departmentOptions} value={selectedDepartment } onChange={setSelectedDepartment}/>
//           </div>
//         </div>

//         {/* ACTION BUTTONS AT BOTTOM */}
//         <div className={styles.buttonsContainer}>
//           <button type="button" onClick={handleCancel}>
//             cancel
//           </button>
//           <button type="button" onClick={handleSave}>
//             save changes
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default InformationForm;

"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./ProfileManagement.module.css"; // your CSS module for this component

/** Define the shape of our form data fields */
interface FormData {
  fname: string;
  lname: string;
  email: string;
  employeeId: string;
  contact: string;
  role: string;
}

/** Strict typing for dropdown options */
const departmentOptions: string[] = [
  "Human Resources",
  "Information Technology",
  "Business",
  "Marketing",
];

const InformationForm: React.FC = () => {
  /** State for standard input fields */
  const [formData, setFormData] = useState<FormData>({
    fname: "",
    lname: "",
    email: "",
    employeeId: "",
    contact: "",
    role: "",
  });

  /** State for handling dropdown selection */
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    "Select"
  );

  /** Handles onChange for standard input fields */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Reset states to clear the form */
  const handleCancel = (): void => {
    setFormData({
      fname: "",
      lname: "",
      email: "",
      employeeId: "",
      contact: "",
      role: "",
    });
    setSelectedDepartment(null);
  };

  /** Demo save logic — replace with API request later */
  const handleSave = (): void => {
    console.log({
      ...formData,
      department: selectedDepartment,
    });
  };

  /** Handle dropdown visibility and selection */
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setOpen((prev) => !prev);

  const handleSelect = (val: string) => {
    setSelectedDepartment(val);
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.informationContainer}>
      <p>Information</p>

      <form className={styles.informationForm}>
        <div className={styles.formContainer}>
          {/* Form fields */}
          <div className={styles.formData}>
            <label htmlFor="fname">First Name</label>
            <input
              name="fname"
              placeholder="First Name"
              type="text"
              value={formData.fname}
              onChange={handleChange}
            />
          </div>

          {/* Last Name */}
          <div className={styles.formData}>
            <label htmlFor="lname">Last Name</label>
            <input
              name="lname"
              placeholder="Last Name"
              type="text"
              value={formData.lname}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className={styles.formData}>
            <label>Email Address</label>
            <input
              name="email"
              placeholder="Email Address"
              type="text"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Employee ID */}
          <div className={styles.formData}>
            <label>Employee ID</label>
            <input
              name="employeeId"
              placeholder="Employee ID"
              type="text"
              value={formData.employeeId}
              onChange={handleChange}
            />
          </div>

          {/* Contact */}
          <div className={styles.formData}>
            <label htmlFor="contact">Mobile Number</label>
            <input
              name="contact"
              placeholder="Contact Number"
              type="text"
              value={formData.contact}
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div className={styles.formData}>
            <label>Role</label>
            <input
              name="role"
              placeholder="Role"
              type="text"
              value={formData.role}
              onChange={handleChange}
            />
          </div>

          {/* Custom Select for Department */}
          <div className={styles.formData}>
            <label>Department</label>
            <div className={styles.wrapper} ref={ref}>
              <div
                className={`${styles.display} ${open ? styles.active : ""}`}
                onClick={toggleOpen}
              >
                {selectedDepartment || "Select Department"}
                <span className={`${styles.arrow} ${open ? styles.open : ""}`}>
                  <svg
                    width="12"
                    height="7"
                    viewBox="0 0 12 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.19309 6.75194L0.983398 1.9257L2.71995 0.316895L6.19309 3.53444L9.66614 0.316895L11.4027 1.9257L6.19309 6.75194Z"
                      fill="black"
                    />
                  </svg>
                </span>
              </div>

              <ul className={`${styles.dropdown} ${open ? styles.open : ""}`}>
                {departmentOptions.map((opt) => (
                  <li key={opt} onClick={() => handleSelect(opt)}>
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.buttonsContainer}>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default InformationForm;
