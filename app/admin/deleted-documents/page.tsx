"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./deletedDocuments.module.css";
import HeaderDashboard from "@/components/shared/adminHeader/headerDashboard";
import AdminSidebar from "@/components/shared/adminSidebar/adminSidebar";
import dp from "../../../assets/profile-placeholder.jpg";

export default function DeletedDocuments() {
  // const cookieStore = await cookies();
  // const session = cookieStore.get("session");

  // console.log("SESSION:", session); // ✅ prints to server logs

  // if (!session) {
  //   redirect("/login"); // or wherever you want
  // }

  // DROPDOWN FUNCTIONS

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

  // type option
  const documentOptions: string[] = ["All Types", "PDF", "Word", "Speadsheet"];
  const [isDocumentOptionOpen, setIsDocumentOptionOpen] =
    useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<string>(
    documentOptions[0]
  );

  const handleSelectedDocument = (type: string) => {
    setSelectedDocument(type);
    setIsDocumentOptionOpen(!isDocumentOptionOpen);
  };

  // department option
  const dateOptions: string[] = [
    "All Dates",
    "March 31, 2025",
    "April 1, 2025",
  ];
  const [isDateOptionOpen, setIsDateOptionOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0]);

  const handleSelectedDate = (date: string) => {
    setSelectedDate(date);
    setIsDateOptionOpen(!isDateOptionOpen);
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
              <h1>deleted documents</h1>
            </div>

            <div className={styles.userManagementSectionContent}>
              <div className={styles.userManagementSectionContentContainer}>
                <div className={styles.userManagementIconAndCount}>
                  <p>83</p>
                </div>

                <h1>total deleted</h1>
              </div>

              <div className={styles.userManagementSectionContentContainer}>
                <div className={styles.userManagementIconAndCount}>
                  <p>26</p>
                </div>

                <h1>this month</h1>
              </div>

              <div className={styles.userManagementSectionContentContainer}>
                <div className={styles.userManagementIconAndCount}>
                  <p>156</p>
                </div>

                <h1>user action</h1>
              </div>

              <div className={styles.userManagementSectionContentContainer}>
                <div className={styles.userManagementIconAndCount}>
                  <p>23</p>
                </div>

                <h1>system alert</h1>
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
                    !isDocumentOptionOpen
                      ? styles.optionBtn
                      : styles.activeOptionBtn
                  }`}
                  onClick={() => setIsDocumentOptionOpen(!isDocumentOptionOpen)}
                >
                  {selectedDocument}
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

                {isDocumentOptionOpen && (
                  <ul className={styles.tableDropdownMenu}>
                    {documentOptions.map((option) => (
                      <li
                        key={option}
                        onClick={() => handleSelectedDocument(option)}
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

              <div className={styles.optionDropdownContainer}>
                <button
                  className={`${
                    !isDateOptionOpen
                      ? styles.optionBtn
                      : styles.activeOptionBtn
                  }`}
                  onClick={() => setIsDateOptionOpen(!isDateOptionOpen)}
                >
                  {selectedDate}
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

                {isDateOptionOpen && (
                  <ul className={styles.tableDropdownMenu}>
                    {dateOptions.map((option) => (
                      <li
                        key={option}
                        onClick={() => handleSelectedDate(option)}
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
                  <th>document</th>
                  <th>creator</th>
                  <th>department</th>
                  <th>deleted by</th>
                  <th>delete on</th>
                  <th>action</th>
                </thead>
                <tbody>
                  

                  

                  <tr>
                    <td id={styles.columnId}>
                      <div className={styles.columnIdContainer}>
                        <div className={styles.cellProfile}>
                          <div>
                            <svg
                            width="30"
                            height="30"
                            viewBox="0 0 30 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="30"
                              height="30"
                              rx="4"
                              fill="#7F1416"
                            />
                            <path
                              d="M3.40517 19V9.367H6.56417C7.27483 9.367 7.91183 9.46233 8.47517 9.653C9.04717 9.84367 9.49784 10.16 9.82717 10.602C10.1652 11.0353 10.3342 11.6333 10.3342 12.396C10.3342 13.124 10.1652 13.7263 9.82717 14.203C9.49784 14.671 9.0515 15.0177 8.48817 15.243C7.9335 15.4683 7.3095 15.581 6.61617 15.581H5.32917V19H3.40517ZM5.32917 14.06H6.48617C7.14483 14.06 7.6345 13.9213 7.95517 13.644C8.2845 13.3667 8.44917 12.9507 8.44917 12.396C8.44917 11.8413 8.27583 11.4557 7.92917 11.239C7.59117 11.0137 7.0885 10.901 6.42117 10.901H5.32917V14.06ZM12.0761 19V9.367H14.7151C15.7031 9.367 16.5481 9.54033 17.2501 9.887C17.9607 10.2337 18.5067 10.758 18.8881 11.46C19.2781 12.162 19.4731 13.0547 19.4731 14.138C19.4731 15.2213 19.2824 16.1227 18.9011 16.842C18.5197 17.5613 17.9824 18.103 17.2891 18.467C16.5957 18.8223 15.7724 19 14.8191 19H12.0761ZM14.0001 17.44H14.5851C15.1917 17.44 15.7117 17.3317 16.1451 17.115C16.5871 16.8897 16.9251 16.5343 17.1591 16.049C17.3931 15.555 17.5101 14.918 17.5101 14.138C17.5101 13.358 17.3931 12.734 17.1591 12.266C16.9251 11.7893 16.5871 11.447 16.1451 11.239C15.7117 11.0223 15.1917 10.914 14.5851 10.914H14.0001V17.44ZM21.3563 19V9.367H27.2843V10.979H23.2803V13.488H26.6993V15.1H23.2803V19H21.3563Z"
                              fill="white"
                            />
                          </svg>
                          </div>
                          <div className={styles.nameAndEmail}>
                            <p>IT Equipment Purchase Request</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>Alexander James Ian J. Fernandez</td>
                    <td>Information Technology</td>
                    <td>
                      Jerald Labalan
                    </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>10:30AM</span>
                    </td>
                    <td>
                      <div id={styles.actionButtons}>
                        <button>restore</button>
                        <button>permanently <br /> delete</button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td id={styles.columnId}>
                      <div className={styles.columnIdContainer}>
                        <div className={styles.cellProfile}>
                          <div>
                            <svg
                            width="30"
                            height="30"
                            viewBox="0 0 30 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="30"
                              height="30"
                              rx="4"
                              fill="#7F1416"
                            />
                            <path
                              d="M3.40517 19V9.367H6.56417C7.27483 9.367 7.91183 9.46233 8.47517 9.653C9.04717 9.84367 9.49784 10.16 9.82717 10.602C10.1652 11.0353 10.3342 11.6333 10.3342 12.396C10.3342 13.124 10.1652 13.7263 9.82717 14.203C9.49784 14.671 9.0515 15.0177 8.48817 15.243C7.9335 15.4683 7.3095 15.581 6.61617 15.581H5.32917V19H3.40517ZM5.32917 14.06H6.48617C7.14483 14.06 7.6345 13.9213 7.95517 13.644C8.2845 13.3667 8.44917 12.9507 8.44917 12.396C8.44917 11.8413 8.27583 11.4557 7.92917 11.239C7.59117 11.0137 7.0885 10.901 6.42117 10.901H5.32917V14.06ZM12.0761 19V9.367H14.7151C15.7031 9.367 16.5481 9.54033 17.2501 9.887C17.9607 10.2337 18.5067 10.758 18.8881 11.46C19.2781 12.162 19.4731 13.0547 19.4731 14.138C19.4731 15.2213 19.2824 16.1227 18.9011 16.842C18.5197 17.5613 17.9824 18.103 17.2891 18.467C16.5957 18.8223 15.7724 19 14.8191 19H12.0761ZM14.0001 17.44H14.5851C15.1917 17.44 15.7117 17.3317 16.1451 17.115C16.5871 16.8897 16.9251 16.5343 17.1591 16.049C17.3931 15.555 17.5101 14.918 17.5101 14.138C17.5101 13.358 17.3931 12.734 17.1591 12.266C16.9251 11.7893 16.5871 11.447 16.1451 11.239C15.7117 11.0223 15.1917 10.914 14.5851 10.914H14.0001V17.44ZM21.3563 19V9.367H27.2843V10.979H23.2803V13.488H26.6993V15.1H23.2803V19H21.3563Z"
                              fill="white"
                            />
                          </svg>
                          </div>
                          <div className={styles.nameAndEmail}>
                            <p>IT Equipment Purchase Request</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>Alexander James Ian J. Fernandez</td>
                    <td>Information Technology</td>
                    <td>
                      Jerald Labalan
                    </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>10:30AM</span>
                    </td>
                    <td>
                      <div id={styles.actionButtons}>
                        <button>restore</button>
                        <button>permanently <br /> delete</button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td id={styles.columnId}>
                      <div className={styles.columnIdContainer}>
                        <div className={styles.cellProfile}>
                          <div>
                            <svg
                            width="30"
                            height="30"
                            viewBox="0 0 30 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="30"
                              height="30"
                              rx="4"
                              fill="#7F1416"
                            />
                            <path
                              d="M3.40517 19V9.367H6.56417C7.27483 9.367 7.91183 9.46233 8.47517 9.653C9.04717 9.84367 9.49784 10.16 9.82717 10.602C10.1652 11.0353 10.3342 11.6333 10.3342 12.396C10.3342 13.124 10.1652 13.7263 9.82717 14.203C9.49784 14.671 9.0515 15.0177 8.48817 15.243C7.9335 15.4683 7.3095 15.581 6.61617 15.581H5.32917V19H3.40517ZM5.32917 14.06H6.48617C7.14483 14.06 7.6345 13.9213 7.95517 13.644C8.2845 13.3667 8.44917 12.9507 8.44917 12.396C8.44917 11.8413 8.27583 11.4557 7.92917 11.239C7.59117 11.0137 7.0885 10.901 6.42117 10.901H5.32917V14.06ZM12.0761 19V9.367H14.7151C15.7031 9.367 16.5481 9.54033 17.2501 9.887C17.9607 10.2337 18.5067 10.758 18.8881 11.46C19.2781 12.162 19.4731 13.0547 19.4731 14.138C19.4731 15.2213 19.2824 16.1227 18.9011 16.842C18.5197 17.5613 17.9824 18.103 17.2891 18.467C16.5957 18.8223 15.7724 19 14.8191 19H12.0761ZM14.0001 17.44H14.5851C15.1917 17.44 15.7117 17.3317 16.1451 17.115C16.5871 16.8897 16.9251 16.5343 17.1591 16.049C17.3931 15.555 17.5101 14.918 17.5101 14.138C17.5101 13.358 17.3931 12.734 17.1591 12.266C16.9251 11.7893 16.5871 11.447 16.1451 11.239C15.7117 11.0223 15.1917 10.914 14.5851 10.914H14.0001V17.44ZM21.3563 19V9.367H27.2843V10.979H23.2803V13.488H26.6993V15.1H23.2803V19H21.3563Z"
                              fill="white"
                            />
                          </svg>
                          </div>
                          <div className={styles.nameAndEmail}>
                            <p>IT Equipment Purchase Request</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>Alexander James Ian J. Fernandez</td>
                    <td>Information Technology</td>
                    <td>
                      Jerald Labalan
                    </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>10:30AM</span>
                    </td>
                    <td>
                      <div id={styles.actionButtons}>
                        <button>restore</button>
                        <button>permanently <br /> delete</button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td id={styles.columnId}>
                      <div className={styles.columnIdContainer}>
                        <div className={styles.cellProfile}>
                          <div>
                            <svg
                            width="30"
                            height="30"
                            viewBox="0 0 30 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="30"
                              height="30"
                              rx="4"
                              fill="#7F1416"
                            />
                            <path
                              d="M3.40517 19V9.367H6.56417C7.27483 9.367 7.91183 9.46233 8.47517 9.653C9.04717 9.84367 9.49784 10.16 9.82717 10.602C10.1652 11.0353 10.3342 11.6333 10.3342 12.396C10.3342 13.124 10.1652 13.7263 9.82717 14.203C9.49784 14.671 9.0515 15.0177 8.48817 15.243C7.9335 15.4683 7.3095 15.581 6.61617 15.581H5.32917V19H3.40517ZM5.32917 14.06H6.48617C7.14483 14.06 7.6345 13.9213 7.95517 13.644C8.2845 13.3667 8.44917 12.9507 8.44917 12.396C8.44917 11.8413 8.27583 11.4557 7.92917 11.239C7.59117 11.0137 7.0885 10.901 6.42117 10.901H5.32917V14.06ZM12.0761 19V9.367H14.7151C15.7031 9.367 16.5481 9.54033 17.2501 9.887C17.9607 10.2337 18.5067 10.758 18.8881 11.46C19.2781 12.162 19.4731 13.0547 19.4731 14.138C19.4731 15.2213 19.2824 16.1227 18.9011 16.842C18.5197 17.5613 17.9824 18.103 17.2891 18.467C16.5957 18.8223 15.7724 19 14.8191 19H12.0761ZM14.0001 17.44H14.5851C15.1917 17.44 15.7117 17.3317 16.1451 17.115C16.5871 16.8897 16.9251 16.5343 17.1591 16.049C17.3931 15.555 17.5101 14.918 17.5101 14.138C17.5101 13.358 17.3931 12.734 17.1591 12.266C16.9251 11.7893 16.5871 11.447 16.1451 11.239C15.7117 11.0223 15.1917 10.914 14.5851 10.914H14.0001V17.44ZM21.3563 19V9.367H27.2843V10.979H23.2803V13.488H26.6993V15.1H23.2803V19H21.3563Z"
                              fill="white"
                            />
                          </svg>
                          </div>
                          <div className={styles.nameAndEmail}>
                            <p>IT Equipment Purchase Request</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>Alexander James Ian J. Fernandez</td>
                    <td>Information Technology</td>
                    <td>
                      Jerald Labalan
                    </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>10:30AM</span>
                    </td>
                    <td>
                      <div id={styles.actionButtons}>
                        <button>restore</button>
                        <button>permanently <br /> delete</button>
                      </div>
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
