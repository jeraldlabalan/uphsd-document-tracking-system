"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./userManagement.module.css";
import HeaderDashboard from "@/components/shared/adminHeader/headerDashboard";
import AdminSidebar from "@/components/shared/adminSidebar/adminSidebar";
import dp from "../../../assets/profile-placeholder.jpg";

export default function UserManagement() {
  // const cookieStore = await cookies();
  // const session = cookieStore.get("session");

  // console.log("SESSION:", session); // ✅ prints to server logs

  // if (!session) {
  //   redirect("/login"); // or wherever you want
  // }

  // DROPDOWN FUNCTIONS

  // account status
  const statusOptions: string[] = ["All Status", "Active", "Inactive"];
  const [isStatusOptionOpen, setIsStatusOptionOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    statusOptions[0]
  );

  const handleSelectedStatus = (status: string) => {
    setSelectedStatus(status);
    setIsStatusOptionOpen(!isStatusOptionOpen);
  };

  // type option
  const typeOptions: string[] = [
    "All Types",
    "Report",
    "Request",
    "Evaluation",
    "Memo",
  ];
  const [isTypeOptionOpen, setIsTypeOptionOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>(typeOptions[0]);

  const handleSelectedType = (type: string) => {
    setSelectedType(type);
    setIsTypeOptionOpen(!isTypeOptionOpen);
  };

  // department option
  const departmentOptions: string[] = [
    "All Departments",
    "Engineering",
    "Business",
    "Information Technology",
    "Human Resource",
    "Medicine",
  ];
  const [isDepartmentOptionsOpen, setIsDepartmentOptionsOpen] =
    useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    departmentOptions[0]
  );

  const handleSelectedDepartment = (department: string) => {
    setSelectedDepartment(department);
    setIsDepartmentOptionsOpen(!isDepartmentOptionsOpen);
  };

  return (
    <div className={styles.container}>
      <div>
        <HeaderDashboard />
      </div>

      <div className={styles.userManagement}>
        <AdminSidebar />

        <div className={styles.userManagementDashboard}>
          <div className={styles.userManagementDashboardSection}>
            <div className={styles.userManagementDashboardHeader}>
              <h1>user management</h1>

              <button className={styles.createUserButton}>
                + create new user
              </button>
            </div>

            <div className={styles.userManagementSectionContent}>
              <div className={styles.userManagementSectionContentContainer}>
                <div className={styles.userManagementIconAndCount}>
                  <p>116</p>
                </div>

                <h1>total users</h1>
              </div>

              <div className={styles.userManagementSectionContentContainer}>
                <div className={styles.userManagementIconAndCount}>
                  <p>89</p>
                </div>

                <h1>active users</h1>
              </div>

              <div className={styles.userManagementSectionContentContainer}>
                <div className={styles.userManagementIconAndCount}>
                  <p>9</p>
                </div>

                <h1>pending approval</h1>
              </div>

              <div className={styles.userManagementSectionContentContainer}>
                <div className={styles.userManagementIconAndCount}>
                  <p>12</p>
                </div>

                <h1>suspended</h1>
              </div>

              <div className={styles.userManagementSectionContentContainer}>
                <div className={styles.userManagementIconAndCount}>
                  <p>6</p>
                </div>

                <h1>new account</h1>
              </div>
            </div>
          </div>

          <div className={styles.accounContainer}>
            <div className={styles.accountContainerSectionHeader}>
              <div className={styles.searchContainer}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  className={styles.searchContainerIcon}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z"
                    className={styles.searchContainerFill}
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search"
                  className={styles.searchField}
                />
              </div>

              <div className={styles.optionDropdownContainer}>
                <button
                  className={`${
                    !isStatusOptionOpen
                      ? styles.optionBtn
                      : styles.activeOptionBtn
                  }`}
                  onClick={() => setIsStatusOptionOpen(!isStatusOptionOpen)}
                >
                  {selectedStatus}
                  <span>
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      className={styles.dropdownOptionIcon}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 6.0006L0.757324 1.758L2.17154 0.34375L5 3.1722L7.8284 0.34375L9.2426 1.758L5 6.0006Z"
                        className={styles.dropdownOptionFill}
                      />
                    </svg>
                  </span>
                </button>

                {isStatusOptionOpen && (
                  <ul className={styles.tableDropdownMenu}>
                    {statusOptions.map((option) => (
                      <li
                        key={option}
                        onClick={() => handleSelectedStatus(option)}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.optionDropdownContainer}>
                <button
                  className={`${
                    !isTypeOptionOpen
                      ? styles.optionBtn
                      : styles.activeOptionBtn
                  }`}
                  onClick={() => setIsTypeOptionOpen(!isTypeOptionOpen)}
                >
                  {selectedType}
                  <span>
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      className={styles.dropdownOptionIcon}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 6.0006L0.757324 1.758L2.17154 0.34375L5 3.1722L7.8284 0.34375L9.2426 1.758L5 6.0006Z"
                        className={styles.dropdownOptionFill}
                      />
                    </svg>
                  </span>
                </button>

                {isTypeOptionOpen && (
                  <ul className={styles.tableDropdownMenu}>
                    {typeOptions.map((option) => (
                      <li
                        key={option}
                        onClick={() => handleSelectedType(option)}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.optionDropdownContainer}>
                <button
                  className={`${
                    !isDepartmentOptionsOpen
                      ? styles.optionBtn
                      : styles.activeOptionBtn
                  }`}
                  onClick={() =>
                    setIsDepartmentOptionsOpen(!isDepartmentOptionsOpen)
                  }
                >
                  {selectedDepartment}
                  <span>
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      className={styles.dropdownOptionIcon}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 6.0006L0.757324 1.758L2.17154 0.34375L5 3.1722L7.8284 0.34375L9.2426 1.758L5 6.0006Z"
                        className={styles.dropdownOptionFill}
                      />
                    </svg>
                  </span>
                </button>

                {isDepartmentOptionsOpen && (
                  <ul className={styles.tableDropdownMenu}>
                    {departmentOptions.map((option) => (
                      <li
                        key={option}
                        onClick={() => handleSelectedDepartment(option)}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.userActivitySectionContent}>
              <table className={styles.userActivityTable}>
                <thead>
                  <th>name</th>
                  <th>department</th>
                  <th>role</th>
                  <th>status</th>
                  <th>last login</th>
                  <th>action</th>
                </thead>
                <tbody>
                  <tr>
                    <td id={styles.columnId}>
                      <div className={styles.columnIdContainer}>
                        <div className={styles.cellProfile}>
                          <Image
                            src={dp}
                            alt="display picture"
                            className={styles.displayPicture}
                          />
                          <div className={styles.nameAndEmail}>
                            <p>Alexander Fernandez</p>
                            <span>a.fernandez@uphsd.edu.ph</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>HR Department</td>
                    <td>Department Head</td>
                    <td>
                      <p className={styles.activeStatus}>active</p>
                    </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>10:30AM</span>
                    </td>
                    <td id={styles.actionButtons}>
                      <button>edit</button>
                      <button>terminate</button>
                    </td>
                  </tr>

                  <tr>
                    <td id={styles.columnId}>
                      <div className={styles.columnIdContainer}>
                        <div className={styles.cellProfile}>
                          <Image
                            src={dp}
                            alt="display picture"
                            className={styles.displayPicture}
                          />

                          <div className={styles.nameAndEmail}>
                            <p>jerald labalan</p>
                            <span>j.labalan@uphsd.edu.ph</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>College of Medicine</td>
                    <td>Staff</td>
                    <td>
                      <p className={styles.inactiveStatus}>inactive</p>
                    </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>10:30AM</span>
                    </td>
                    <td id={styles.actionButtons}>
                      <button>edit</button>
                      <button>terminate</button>
                    </td>
                  </tr>

                  <tr>
                    <td id={styles.columnId}>
                      <div className={styles.columnIdContainer}>
                        <div className={styles.cellProfile}>
                          <Image
                            src={dp}
                            alt="display picture"
                            className={styles.displayPicture}
                          />

                          <div className={styles.nameAndEmail}>
                            <p>neil yvan caliwan</p>
                            <span>n.caliwant@uphsd.edu.ph</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>HR Department</td>
                    <td>Department Head</td>
                    <td>
                      <p className={styles.activeStatus}>active</p>
                    </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>10:30AM</span>
                    </td>
                    <td id={styles.actionButtons}>
                      <button>edit</button>
                      <button>terminate</button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className={styles.tableNavigationContainer}>
                <p>Showing 1 - 4 of 116 Users</p>

                <div className={styles.tableNavigation}>
                  <button className={styles.tableNavigation}>previous</button>
                  <div className={styles.tablePageContainer}>
                    <div className={styles.tablePage}>1</div>
                    <div className={styles.tablePage}>2</div>
                    <div className={styles.tablePage}>3</div>
                  </div>
                  <button className={styles.tableNavigation}>next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
