'use client';
import styles from './empDashboardStyles.module.css';
import EmpHeader from '@/components/shared/empHeader';  
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const dashboardData = [
  { count: 6, label: 'Pending Signatures', style: styles.red },
  { count: 12, label: 'In Process', style: styles.cyan },
  { count: 23, label: 'Completed', style: styles.green },
  { count: 5, label: 'New Request', style: styles.orange },
];

const recentDocuments = [
  {
    title: 'Faculty Evaluation Form',
    to: 'Mr. Remollo',
    department: 'HR Department',
    date: 'July 1, 2025',
    priority: 'High',
    status: 'Pending Signature',
  },
  {
    title: 'Student Good Moral Certificate',
    to: 'Mr. Talisay',
    department: 'IT Department',
    date: 'July 1, 2025',
    priority: 'High',
    status: 'Pending Signature',
  },
];

export default function EmployeeDashboard() {

useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);


  return (
    <div>
        <EmpHeader/>
    <div className={styles.container}>
      
        <div data-aos="fade-up" className={styles.contentSection}>
      <h2 className={styles.sectionTitle}>Dashboard</h2>
      <hr className={styles.separator} />

      <div className={styles.grid}>
        {dashboardData.map((item, idx) => (
          <div key={idx} className={`${styles.card} ${item.style}`}>
            <div className={styles.cardCount}>{item.count}</div>
            <div className={styles.cardLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <h3 className={styles.recentDocuments}>Recent Documents</h3>
      <hr className={styles.separator} />

      {recentDocuments.map((doc, idx) => (
        <div key={idx} className={styles.documentCard}>
          <div className={styles.documentHeader}>
            <h4 className={styles.documentTitle}>{doc.title}</h4>
            <span className={styles.statusBadge}>{doc.status}</span>
          </div>
          <div className={styles.documentDetails}>
            <p><strong>To:</strong> {doc.to}</p>
            <p><strong>Department:</strong> {doc.department}</p>
            <p><strong>Date Received:</strong> {doc.date}</p>
            <p><strong>Priority:</strong> {doc.priority}</p>
          </div>
         
        </div>
      ))}
      </div>
    </div>
    </div>
  );
}
