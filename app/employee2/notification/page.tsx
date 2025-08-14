"use client";

import { useState, useEffect } from "react";
import styles from "./notificationStyles.module.css";
import EmpHeader from "@/components/shared/empHeader";
import { Bell } from "lucide-react";

type Notification = {
  id: number;
  title: string;
  content: string;
  time: string;
  tag: string;
  status: string;
  color: string;
  name?: string; // Optional, in case the name is not available
  createdat?: string; // Optional, in case the created date is not available
  department?: string; // Optional, in case the department is not available
};

// const initialNotifications: Notification[] = [
//   {
//     id: 1,
//     title: "IT Equipment Purchase Request",
//     content:
//       "Kurt Macaranas has submitted a request for an academic transcript. The request is pending approval from the Registrar's office.",
//     time: "15 minutes ago",
//     tag: "Document Request",
//     status: "Unread",
//     color: "#ff8000ff",
//   },
//   {
//     id: 2,
//     title: "Student Good Moral Request",
//     content:
//       'The document request for "Student Good Moral" submitted by Kurt Macaranas has been approved.',
//     time: "15 minutes ago",
//     tag: "Document Request",
//     status: "Unread",
//     color: "#2E7D32",
//   },
//   {
//     id: 3,
//     title: "Document Approval",
//     content:
//       "Jerald Labalan has submitted a request for an academic transcript. The request is pending approval from.",
//     time: "15 minutes ago",
//     tag: "Document for Approval",
//     status: "Unread",
//     color: "#00796B",
//   },
// ];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<Notification | null>(null);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/employee/notification");
        const data = await response.json();

        console.log("Raw notifications:", data); // 👀 Check the exact structure

        const mapped = data
          .map((notif: any) => {
            const id = Number(notif.NotificationID ?? notif.id);

            if (isNaN(id)) {
              console.error("❌ Invalid ID detected:", notif);
              return null; // skip this entry
            }

            return {
              ...notif,
              id,
              status: notif.status,
            };
          })
          .filter((notif: any) => notif !== null); // filter out any null entries
        console.log("Mapped notifications:", mapped); // ✅ Check the final structure

        setNotifications(mapped);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const toggleAll = () => {
    setSelected(
      selected.length === notifications.length
        ? []
        : notifications.map((n) => n.id)
    );
  };

  const handleDeleteNotification = async (id: number) => {
  try {
    const res = await fetch("/api/employee/notification/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }), // send notification ID
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to delete notification");
    }

    // ✅ Optionally update your state to remove the deleted notification
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );

    console.log("Notification deleted successfully");
  } catch (err) {
    console.error("Error deleting notification:", err);
  }
};


  const deleteSelected = () => {
    setNotifications(notifications.filter((n) => !selected.includes(n.id)));
    setSelected([]);
  };

  const updateNotificationStatus = async (
    id: number,
    status: "Read" | "Unread"
  ) => {
    try {
      if (typeof id !== "number" || isNaN(id)) {
        console.error("Invalid ID:", id); // ❗ prevent sending wrong ID
        return;
      }

      console.log("Sending update for ID:", id); // ✅ confirm what's being sent

      const response = await fetch("/api/employee/notification/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }), // ✅ safe destructuring
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to update status:", error);
      } else {
        console.log("Status update successful.");
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === id ? { ...notif, status } : notif))
        );
      }
    } catch (error) {
      console.error("Error sending update:", error);
    }
  };

  const handleCancelButtonClick = () => {
  setShowDeleteModal(false);
};

// Handles clicking on the backdrop (outside modal content)
const handleBackdropClick = (
  e: React.MouseEvent<HTMLDivElement>,
  closeAction: () => void
) => {
  if (e.target === e.currentTarget) {
    closeAction();
  }
};




  const markRead = (id: number) => updateNotificationStatus(id, "Read");
  const markUnread = (id: number) => updateNotificationStatus(id, "Unread");

  // Pagination state
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5; // number of notifications per page

// Calculate indexes
const totalPages = Math.ceil(notifications.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedNotifications = notifications.slice(startIndex, endIndex);

// Pagination handlers
const handlePrev = () => {
  setCurrentPage((prev) => Math.max(prev - 1, 1));
};

const handleNext = () => {
  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
};

  return (
    <div>
      <EmpHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Notifications</h2>
          </div>

          <hr className={styles.separator} />

          <div className={styles.main}>
           

            {paginatedNotifications.map((notification, index) => (
              <div
                key={index}
                className={styles.notification}
                style={{
                  backgroundColor:
                    notification.status === "Unread"
                      ? "#f8e0e6"
                      : "transparent",
                }}
              >
                <div className={styles.details}>
                  <h3
                    className={styles.notifTitle}
                    style={{
                      fontWeight:
                        notification.status === "Unread" ? "bold" : "normal",
                    }}
                  >
                    {notification.title}
                  </h3>

                  <p className={styles.description}>{notification.content}</p>
                  <div className={styles.meta}>
                    <span className={styles.time}>{notification.time}</span>
                    <span className={styles.tag}>{notification.tag}</span>
                  </div>
                </div>

                <div className={styles.sideActions}>
                  <div className={styles.status}>{notification.status}</div>
                  <div className={styles.buttons}>
                    <button
                      className={styles.view}
                      onClick={() => {
                        setSelectedNotification(notification);
                        if (notification.status === "Unread") {
                          markRead(notification.id);
                        }
                      }}
                    >
                      View
                    </button>
                    {notification.status === "Unread" && (
                      <button
                        className={styles.markRead}
                        onClick={() =>
                          updateNotificationStatus(notification.id, "Read")
                        }
                      >
                        Mark as Read
                      </button>
                    )}

                    <button
                      className={styles.delete}
                      onClick={() => {
                        setNotificationToDelete(notification);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
  <button onClick={handlePrev} disabled={currentPage === 1}>
    Previous
  </button>
  <span>
    Page {currentPage} of {totalPages}
  </span>
  <button onClick={handleNext} disabled={currentPage === totalPages}>
    Next
  </button>
</div>

        </div>

        {/* View Modal Styles */}
{selectedNotification && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <button
        className={styles.closeButton}
        onClick={() => setSelectedNotification(null)}
      >
        &times;
      </button>

      <h2 className={styles.modalTitle}>Notification Details</h2>

      <div className={styles.documentHeader}>
        {/* Left: Notification Icon */}
        <Bell size={40} className={styles.icon} />

        {/* Middle: Details */}
        <div className={styles.headerInfo}>
          <h3 className={styles.highlight}>{selectedNotification.title}</h3>
          <p>
            <span className={styles.highlight}>Requested by:</span>{" "}
            {selectedNotification.name || "Unknown User"}
          </p>
          <p>
            <span className={styles.highlight}>Department:</span>{" "}
            {selectedNotification.department || "Unknown Department"}
          </p>
          <p>
            <span className={styles.highlight}>Date/Time:</span>{" "}
            {selectedNotification.time}
          </p>
          <p>
            <span className={styles.highlight}>Message:</span>{" "}
            {selectedNotification.content}
          </p>
        </div>

        {/* Right: Profile Pic or Initial */}
        {selectedNotification.profilePic ? (
          <img
            src={selectedNotification.profilePic}
            alt={selectedNotification.name || "User"}
            className={styles.profileImage}
          />
        ) : (
          <div className={styles.userIcon}>
            {selectedNotification.name
              ? selectedNotification.name.charAt(0).toUpperCase()
              : "?"}
          </div>
        )}
      </div>
    </div>
  </div>
)}

       {/* Delete Modal - using same style as permanent delete modal */}
{showDeleteModal && notificationToDelete && (
          <div className={styles.deletemodalOverlay} onClick={(e) =>
      handleBackdropClick(e, () => {
        setShowDeleteModal(false);
        setNotificationToDelete(null);
      })
    }>
            <div className={styles.deletemodalContent} >
              <h3 className={styles.deletemodalTitle}>Confirm Deletion</h3>
              <p>Are you sure you want to delete{" "}
          <strong>{notificationToDelete.title}</strong>?</p>
              <div className={styles.modalActions}>
                <button onClick=
              {handleCancelButtonClick} className={styles.deletecancelButton}>Cancel</button>
                <button onClick={async () => {
              if (!notificationToDelete) return;
              await handleDeleteNotification(notificationToDelete.id);
              setShowDeleteModal(false);
              setNotificationToDelete(null);
            }} className={styles.deleteButton}>Continue</button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
