import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import styles from './adminDashboardStyles.module.css';
import HeaderDashboard from "@/components/shared/adminHeader/headerDashboard";
import AdminSidebar from "@/components/shared/adminSidebar/adminSidebar";
import dp from "../../../assets/profile-placeholder.jpg";


export default async function AdminDashboard() {
 
  // const cookieStore = await cookies();
  // const session = cookieStore.get("session");

  // console.log("SESSION:", session); // ✅ prints to server logs

  // if (!session) {
  //   redirect("/login"); // or wherever you want
  // } else if (session.value !== "Admin" and session.value === "Employee") {
  //   redirect("/employee/dashboard"); // or wherever you want
  // }



  
  return (
    <div className={styles.container}>
      <div>
        <HeaderDashboard />
      </div>

      <div className={styles.contentContainer}>

        <AdminSidebar />

        <div className={styles.adminDashboard}>

           <div className={styles.dashboardSection}>

              <div className={styles.dashboardSectionHeader}>
                <h1>
                  admin dashboard
                </h1>
              </div>

              <div className={styles.dashboardSectionContent}>

                <div className={styles.dashboardSectionContentContainer}>
                  
                  <div className={styles.dashboardIconAndCount}>

                    <svg width="40" height="34" viewBox="0 0 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28.3332 32V28.6667C28.3332 26.8986 27.6308 25.2029 26.3805 23.9526C25.1303 22.7024 23.4346 22 21.6665 22H8.33317C6.56506 22 4.86937 22.7024 3.61913 23.9526C2.36888 25.2029 1.6665 26.8986 1.6665 28.6667V32M38.3332 32V28.6667C38.3321 27.1895 37.8404 25.7546 36.9354 24.5872C36.0305 23.4198 34.7634 22.5859 33.3332 22.2167M26.6665 2.21667C28.1005 2.58384 29.3716 3.41784 30.2792 4.58718C31.1869 5.75653 31.6796 7.19472 31.6796 8.675C31.6796 10.1553 31.1869 11.5935 30.2792 12.7628C29.3716 13.9322 28.1005 14.7662 26.6665 15.1333M21.6665 8.66667C21.6665 12.3486 18.6817 15.3333 14.9998 15.3333C11.3179 15.3333 8.33317 12.3486 8.33317 8.66667C8.33317 4.98477 11.3179 2 14.9998 2C18.6817 2 21.6665 4.98477 21.6665 8.66667Z" stroke="#1E1E1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                    <p>
                      500
                    </p>

                  </div>

                  <h1>
                    total users
                  </h1>
                </div>

                <div className={styles.dashboardSectionContentContainer}>

                  <div className={styles.dashboardIconAndCount}>

                    <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.3332 2.33337H5.99984C5.11578 2.33337 4.26794 2.68456 3.64281 3.30968C3.01769 3.93481 2.6665 4.78265 2.6665 5.66671V32.3334C2.6665 33.2174 3.01769 34.0653 3.64281 34.6904C4.26794 35.3155 5.11578 35.6667 5.99984 35.6667H25.9998C26.8839 35.6667 27.7317 35.3155 28.3569 34.6904C28.982 34.0653 29.3332 33.2174 29.3332 32.3334V12.3334M19.3332 2.33337L29.3332 12.3334M19.3332 2.33337V12.3334H29.3332M22.6665 20.6667H9.33317M22.6665 27.3334H9.33317M12.6665 14H9.33317" stroke="#1E1E1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

                    <p>
                      45
                    </p>

                  </div>

                  <h1>
                    total documents
                  </h1>

                </div>

                <div className={styles.dashboardSectionContentContainer}>

                  <div className={styles.dashboardIconAndCount}>

                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M32.4838 9.46305L35.7136 6.6947L38.8562 9.38844L35.6264 12.1568C38.3633 15.0895 40 18.8095 40 22.8571C40 32.325 31.0458 40 20 40C8.95431 40 0 32.325 0 22.8571C0 13.3894 8.95431 5.71429 20 5.71429C24.7222 5.71429 29.0622 7.11709 32.4838 9.46305ZM20 36.1905C28.5911 36.1905 35.5556 30.221 35.5556 22.8571C35.5556 15.4934 28.5911 9.52381 20 9.52381C11.4089 9.52381 4.44444 15.4934 4.44444 22.8571C4.44444 30.221 11.4089 36.1905 20 36.1905ZM17.7778 13.3333H22.2222V24.7619H17.7778V13.3333ZM11.1111 0H28.8889V3.80952H11.1111V0Z" fill="black"/>
</svg>

                    <p>
                      23
                    </p>

                  </div>

                  <h1>
                    pending approvals
                  </h1>

                </div>

                <div className={styles.dashboardSectionContentContainer}>

                <div className={styles.dashboardIconAndCount}>

                    <svg width="34" height="30" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M33.3333 30H0V26.6667H1.66667V1.66667C1.66667 0.7462 2.41287 0 3.33333 0H26.6667C27.5872 0 28.3333 0.7462 28.3333 1.66667V10H31.6667V26.6667H33.3333V30ZM25 26.6667H28.3333V13.3333H18.3333V26.6667H21.6667V16.6667H25V26.6667ZM25 10V3.33333H5V26.6667H15V10H25ZM8.33333 13.3333H11.6667V16.6667H8.33333V13.3333ZM8.33333 20H11.6667V23.3333H8.33333V20ZM8.33333 6.66667H11.6667V10H8.33333V6.66667Z" fill="black"/>
</svg>
          <p>
                      18
                    </p>

                  </div>

                  <h1>
                    departments
                  </h1>

                </div>

              </div>

           </div>

           <div className={styles.userActivitySection}>
              <div className={styles.userActivitySectionHeader}>
                <h1>
                  recent user activity
                </h1>
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
                        <Image src={dp} alt="display picture" className={styles.displayPicture} />
                      <div className={styles.nameAndEmail}>
                        <p>
                          Alexander Fernandez
                        </p>
                        <span>
                          a.fernandez@uphsd.edu.ph
                        </span>
                      </div>
                      </div>
                      </div>
                    </td>
                    <td>HR Department</td>
                    <td>Department Head</td>
                    <td>
                        <p className={styles.activeStatus}>
                          active
                        </p>
                      </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>
                        10:30AM
                      </span>
                    </td>
                    <td><button>View</button></td>
                    </tr>

                    <tr>
                      <td id={styles.columnId}>
                      <div className={styles.columnIdContainer}>

                        <div className={styles.cellProfile}>

                          <Image src={dp} alt="display picture" className={styles.displayPicture} />

                          <div className={styles.nameAndEmail}>
                          <p>
                            jerald labalan
                          </p>
                          <span>
                            j.labalan@uphsd.edu.ph
                          </span>
                          </div>

                        </div>

                      </div>
                    </td>
                    <td>College of Medicine</td>
                    <td>Staff</td>
                    <td>
                        <p className={styles.inactiveStatus}>
                          inactive
                        </p>
                      </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>
                        10:30AM
                      </span>
                    </td>
                    <td><button>View</button></td>
                    </tr>

                    <tr>
                      <td id={styles.columnId}>
                      <div className={styles.columnIdContainer}>

                        <div className={styles.cellProfile}>
                          
                          <Image src={dp} alt="display picture" className={styles.displayPicture} />

                          <div className={styles.nameAndEmail}>
                          <p>
                            neil yvan caliwan
                          </p>
                          <span>
                            n.caliwant@uphsd.edu.ph
                          </span>
                          </div>

                        </div>

                      </div>
                    </td>
                    <td>HR Department</td>
                    <td>Department Head</td>
                    <td>
                        <p className={styles.activeStatus}>
                          active
                        </p>
                      </td>
                    <td id={styles.lastLoginDate}>
                      <p>July 5, 2025</p>
                      <span>
                        10:30AM
                      </span>
                    </td>
                    <td><button>View</button></td>
                    </tr>

                    

                  </tbody>
                </table>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
