"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./ProfileManagement.module.css";
import toast from "react-hot-toast";

/** Define the shape of our form data fields */
interface FormData {
  fname: string;
  lname: string;
  email: string;
  employeeId: string;
  contact: string;
  sex: string;
  position: string;
}

interface UserInfo {
  FirstName: string | null;
  LastName: string | null;
  Email: string;
  EmployeeID: string | null;
  MobileNumber: string | null;
  Sex: string | null;
  Position: string | null;
}

interface PositionDTO {
  Name: string;
}

interface InformationFormProps {
  userInfo: UserInfo | null;
  onUserInfoUpdate: (updatedInfo: Partial<UserInfo>) => void;
}

const InformationForm: React.FC<InformationFormProps> = ({
  userInfo,
  onUserInfoUpdate,
}) => {
  // Helper function to transform mobile number from +63 to 09 format for display
  const transformMobileForDisplay = (mobileNumber: string | null): string => {
    if (!mobileNumber) return "";
    if (mobileNumber.startsWith("+63")) {
      return `0${mobileNumber.substring(3)}`; // Remove +63, add 0
    }
    return mobileNumber; // Keep as is if not in +63 format
  };

  // Helper function to transform mobile number from 09 to +63 format for database
  const transformMobileForDB = (mobileNumber: string): string | null => {
    if (!mobileNumber.trim()) return null;
    return `+63${mobileNumber.trim().substring(1)}`; // Remove 0, add +63
  };
  /** State for standard input fields */
  const [formData, setFormData] = useState<FormData>({
    fname: "",
    lname: "",
    email: "",
    employeeId: "",
    contact: "",
    sex: "",
    position: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch available options from API
  const [positionOptions, setPositionOptions] = useState<string[]>([]);
  const sexOptions: string[] = ["Male", "Female"];

  // Load user data into form when userInfo changes
  useEffect(() => {
    if (userInfo) {
      setFormData({
        fname: userInfo.FirstName || "",
        lname: userInfo.LastName || "",
        email: userInfo.Email || "",
        employeeId: userInfo.EmployeeID || "",
        contact: transformMobileForDisplay(userInfo.MobileNumber),
        sex: userInfo.Sex || "",
        position: userInfo.Position || "",
      });
    }
  }, [userInfo]);

  // Fetch position options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const posRes = await fetch("/api/user/position");

        if (posRes.ok) {
          const posData: PositionDTO[] = await posRes.json();
          setPositionOptions(posData.map((pos) => pos.Name));
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  /** Handles onChange for standard input fields */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Reset form to current user data */
  const handleCancel = (): void => {
    if (userInfo) {
      setFormData({
        fname: userInfo.FirstName || "",
        lname: userInfo.LastName || "",
        email: userInfo.Email || "",
        employeeId: userInfo.EmployeeID || "",
        contact: transformMobileForDisplay(userInfo.MobileNumber),
        sex: userInfo.Sex || "",
        position: userInfo.Position || "",
      });
    }
    setIsEditing(false);
  };

  /** Save user information */
  const handleSave = async (): Promise<void> => {
    if (!userInfo) return;

    // Basic validation
    if (!formData.fname.trim() || !formData.lname.trim()) {
      toast.error("Firstname and Lastname are required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Mobile number validation (only when saving)
    if (formData.contact.trim()) {
      const mobileNumber = formData.contact.trim();
      if (!/^09\d{9}$/.test(mobileNumber)) {
        toast.error("Mobile number must be 11 digits starting with 09");
        return;
      }
    }

    // Confirmation dialog before saving
    const isConfirmed = window.confirm(
      "Are you sure you want to save these changes?"
    );

    if (!isConfirmed) return; // Exit if the user doesn't confirm

    setIsLoading(true);

    try {
      // Transform mobile number to +63 format
      let mobileNumberForDB = null;
      if (formData.contact.trim()) {
        const mobileNumber = formData.contact.trim();
        mobileNumberForDB = `+63${mobileNumber.substring(1)}`; // Remove 0, add +63
      }

      const response = await fetch("/api/admin/settings/update-user-info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.fname.trim(),
          lastName: formData.lname.trim(),
          email: formData.email.trim(),
          employeeId: formData.employeeId.trim() || null,
          mobileNumber: mobileNumberForDB,
          sex: formData.sex || null,
          position: formData.position || null,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        toast.success("Information updated successfully!");

        // Update parent component immediately for instant display
        onUserInfoUpdate({
          FirstName: formData.fname.trim(),
          LastName: formData.lname.trim(),
          Email: formData.email.trim(),
          EmployeeID: formData.employeeId.trim() || null,
          MobileNumber: formData.contact.trim() || null,
          Sex: formData.sex || null,
          Position: formData.position || null,
        });

        setIsEditing(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update information");
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      toast.error("An error occurred while updating information");
    } finally {
      setIsLoading(false);
    }
  };

  /** Handle dropdown visibility and selection for each dropdown */
  const [openDropdown, setOpenDropdown] = useState<null | "sex" | "position">(
    null
  );

  const refSex = useRef<HTMLDivElement>(null);
  const refPosition = useRef<HTMLDivElement>(null);

  const toggleOpen = (dropdown: "sex" | "position") => {
    if (!isEditing) return;
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const handleSelect = (dropdown: "sex" | "position", val: string) => {
    if (dropdown === "sex") setFormData((prev) => ({ ...prev, sex: val }));
    else if (dropdown === "position")
      setFormData((prev) => ({ ...prev, position: val }));

    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        refSex.current &&
        !refSex.current.contains(event.target as Node) &&
        refPosition.current &&
        !refPosition.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.informationContainer}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <p>Information</p>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{
              backgroundColor: "var(--color-maroon)",
              color: "var(--color-yellow)",
              border: "none",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Edit Information
          </button>
        ) : null}
      </div>

      <form
        className={styles.informationForm}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={styles.formContainer}>
          {/* Form fields */}
          <div className={styles.formData}>
            <label htmlFor="fname">Firstname</label>
            <input
              name="fname"
              placeholder="Firstname"
              type="text"
              value={formData.fname}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {/* Last Name */}
          <div className={styles.formData}>
            <label htmlFor="lname">Lastname</label>
            <input
              name="lname"
              placeholder="Lastname"
              type="text"
              value={formData.lname}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {/* Email */}
          <div className={styles.formData}>
            <label>Email Address</label>
            <input
              name="email"
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              readOnly
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
              disabled={!isEditing}
              readOnly
            />
          </div>

          {/* Contact */}
          <div className={styles.formData}>
            <label htmlFor="contact">Mobile Number</label>
            <input
              name="contact"
              placeholder="Mobile Number"
              type="tel"
              value={formData.contact}
              onChange={handleChange}
              disabled={!isEditing}
              maxLength={11}
            />
          </div>

          {/* Sex Dropdown */}
          <div className={styles.formData}>
            <label>Sex</label>
            <div className={styles.wrapper} ref={refSex}>
              <div
                className={`${styles.display} ${
                  openDropdown === "sex" ? styles.active : ""
                } ${!isEditing ? styles.disabled : ""}`}
                onClick={() => toggleOpen("sex")}
              >
                {formData.sex || "Select"}
                <span
                  className={`${styles.arrow} ${
                    openDropdown === "sex" ? styles.open : ""
                  }`}
                >
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

              <ul
                className={`${styles.dropdown} ${
                  openDropdown === "sex" ? styles.open : ""
                }`}
              >
                {sexOptions
                  .filter((opt) => opt !== formData.sex)
                  .map((opt) => (
                    <li key={opt} onClick={() => handleSelect("sex", opt)}>
                      {opt}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Position Dropdown */}
          <div className={styles.formData}>
            <label>Position</label>
            <div className={styles.wrapper} ref={refPosition}>
              <div
                className={`${styles.display} ${
                  openDropdown === "position" ? styles.active : ""
                } ${!isEditing ? styles.disabled : ""}`}
                onClick={() => toggleOpen("position")}
              >
                {formData.position || "Select"}
                <span
                  className={`${styles.arrow} ${
                    openDropdown === "position" ? styles.open : ""
                  }`}
                >
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

              <ul
                className={`${styles.dropdown} ${
                  openDropdown === "position" ? styles.open : ""
                }`}
              >
                {positionOptions
                  .filter((opt) => opt !== formData.position)
                  .map((opt) => (
                    <li key={opt} onClick={() => handleSelect("position", opt)}>
                      {opt}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons - Only show when editing */}
        {isEditing && (
          <div className={styles.buttonsContainer}>
            <button type="button" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default InformationForm;
