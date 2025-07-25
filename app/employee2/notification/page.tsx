'use client';

import { useState } from 'react';
import styles from './notificationStyles.module.css';
import EmpHeader from '@/components/shared/empHeader';

type Notification = {
  id: number;
  title: string;
  content: string;
  time: string;
  tag: string;
  status: string;
  color: string;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'IT Equipment Purchase Request',
    content:
      "Kurt Macaranas has submitted a request for an academic transcript. The request is pending approval from the Registrar's office.",
    time: '15 minutes ago',
    tag: 'Document Request',
    status: 'Unread',
    color: '#ff8000ff',
  },
  {
    id: 2,
    title: 'Student Good Moral Request',
    content:
      'The document request for "Student Good Moral" submitted by Kurt Macaranas has been approved.',
    time: '15 minutes ago',
    tag: 'Document Request',
    status: 'Unread',
    color: '#2E7D32',
  },
  {
    id: 3,
    title: 'Document Approval',
    content:
      'Jerald Labalan has submitted a request for an academic transcript. The request is pending approval from.',
    time: '15 minutes ago',
    tag: 'Document for Approval',
    status: 'Unread',
    color: '#00796B',
  },
];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);


  const toggleSelect = (id: number) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelected(selected.length === notifications.length ? [] : notifications.map(n => n.id));
  };

  const deleteSelected = () => {
    setNotifications(notifications.filter(n => !selected.includes(n.id)));
    setSelected([]);
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
          <div className={styles.header}>
            <span className={styles.subtitle}>All Notifications</span>
            <div className={styles.actionsHeader}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.length === notifications.length}
                  onChange={toggleAll}
                />
                Select All
              </label>
              <button className={styles.deleteSelected} onClick={deleteSelected}>
                Delete Selected
              </button>
            </div>
          </div>

          {notifications.map(notification => (
            <div key={notification.id} className={styles.notification}>
              <input
                type="checkbox"
                checked={selected.includes(notification.id)}
                onChange={() => toggleSelect(notification.id)}
              />
              <div className={styles.bar} style={{ backgroundColor: notification.color }}></div>

              <div className={styles.details}>
                <h3 className={styles.notifTitle}>{notification.title}</h3>
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
                    onClick={() => setSelectedNotification(notification)}
                  >
                    View
                  </button>
                  <button className={styles.markRead}>Mark Read</button>
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
      </div>

{/* View Modal Styles */}
{selectedNotification && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <button className={styles.closeButton} onClick={() => setSelectedNotification(null)}>
        &times;
      </button>

      <h2 className={styles.modalTitle}>Document Details</h2>

      <div className={styles.documentHeader}>
        <span className={styles.pdfTag}>PDF</span>
        <div className={styles.headerInfo}>
          <h3>{selectedNotification.title}</h3>
          <p>Requested by: {selectedNotification.title.includes("Kurt") ? "Kurt Macaranas" : "Jerald Labalan"}</p>
          <p>Department: {selectedNotification.title.includes("IT") ? "IT Department" : "Student Services"}</p>
          <p>Date/Time: July 7, 2025 – 8:30 AM</p>
        </div>
        <span className={styles.status}>Processing</span>
      </div>

      <div className={styles.timelineSection}>
        <div className={styles.timelineTitle}>Processing Timeline</div>
      <div className={styles.timelineList}>
        <div className={styles.timelineItem}>
          <div className={styles.timelineIcon}>🟢</div>
          <div className={styles.timelineText}>
            <p><strong>Document Submitted</strong></p>
            <p className="byline">
              {selectedNotification.content}
            </p>
            <div className={styles.timelineDate}>{selectedNotification.time}</div>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.timelineIcon}>🟢</div>
          <div className={styles.timelineText}>
            <p><strong>Budget Approval</strong></p>
            <p className="byline">
              Budget allocation confirmed and purchase approved<br />
              By: Meryl Delacruz (Finance Director)
            </p>
            <div className={styles.timelineDate}>July 8, 2025 – 2:30 PM</div>
          </div>
        </div>
      </div>
         </div>


    </div>
  </div>
)}

{/* Delete Modal Styles */}
{showDeleteModal && notificationToDelete && (
  <div className={styles.deleteModalOverlay}>
    <div className={styles.deleteModalContent}>
      <button
        className={styles.deleteModalClose}
        onClick={() => setShowDeleteModal(false)}
      >
        &times;
      </button>
      <h2 className={styles.deleteModalTitle}>Confirm Deletion</h2>
      <p>
        Are you sure you want to delete <strong>{notificationToDelete.title}</strong>?
      </p>
      <div className={styles.deleteModalButtons}>
        <button
          className={styles.cancelButton}
          onClick={() => {
            setShowDeleteModal(false);
            setNotificationToDelete(null);
          }}
        >
          Cancel
        </button>
        <button
          className={styles.confirmDeleteButton}
          onClick={() => {
            setNotifications(prev =>
              prev.filter(n => n.id !== notificationToDelete.id)
            );
            setShowDeleteModal(false);
            setNotificationToDelete(null);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

    </div>
      </div>

  );  }
