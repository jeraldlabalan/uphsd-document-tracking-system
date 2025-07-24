'use client';

import { useState, useEffect } from 'react';
import styles from './notificationStyles.module.css';
import EmpHeader from '@/components/shared/empHeader';
import { Search as SearchIcon } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Notifications() {

useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);


  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const notifications = [
    {
      document: 'DOC1',
      type: 'Report',
      sender: 'Neil',
      department: 'Finance',
      date: 'July 22, 2025',
      dueDate: 'July 30, 2025',
      status: 'Unread',
    },
    {
      document: 'DOC2',
      type: 'Evaluation',
      sender: 'Jerald',
      department: 'HR',
      date: 'July 20, 2025',
      dueDate: 'July 28, 2025',
      status: 'Read',
    },
    {
      document: 'DOC3',
      type: 'Request',
      sender: 'Kurt',
      department: 'Learning & Dev',
      date: 'July 18, 2025',
      dueDate: 'July 25, 2025',
      status: 'Unread',
    },
  ];

  const filtered = notifications.filter((n) => {
    const searchMatch =
      n.document.toLowerCase().includes(search.toLowerCase()) ||
      n.sender.toLowerCase().includes(search.toLowerCase()) ||
      n.department.toLowerCase().includes(search.toLowerCase());

    const typeMatch = !typeFilter || n.type === typeFilter;
    const deptMatch = !departmentFilter || n.department === departmentFilter;

    return searchMatch && typeMatch && deptMatch;
  });

  return (
    <div>
          <EmpHeader />
          <div className={styles.container}>
            <div data-aos="fade-up" className={styles.contentSection}>
              <div className={styles.headerRow}>
                <h2 className={styles.pageTitle}>Notifications</h2>
              
    
              </div>
     
          <hr className={styles.separator} />

          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className={styles.dropdown}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Report">Report</option>
              <option value="Request">Request</option>
              <option value="Evaluation">Evaluation</option>
              <option value="Notice">Notice</option>
            </select>

            <select
              className={styles.dropdown}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Learning & Dev">Learning & Dev</option>
              <option value="IT">IT</option>
            </select>
          </div>

          <table className={styles.docTable}>
            <thead>
              <tr>
                <th>Document</th>
                <th>Sent By</th>
                <th>Department</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((note, i) => (
                <tr key={i}>
                  <td>{note.document}</td>
                  <td>{note.sender}</td>
                  <td>{note.department}</td>
                  <td>{note.date}</td>
                  <td>{note.dueDate}</td>
                  <td className={styles.actions}>
                    <a href="#">View</a> | <a href="#">Edit</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
