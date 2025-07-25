'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './settingStyles.module.css';
import EmpHeader from '@/components/shared/empHeader';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function ProfileSettings() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempPreview, setTempPreview] = useState<string | null>(null);

  const [info, setInfo] = useState({
    firstName: 'Kai',
    lastName: 'Sotto',
    email: 'k.sottos@uphsd.edu.ph',
    employeeId: '123456',
    mobile: '',
    role: 'Head Coordinator',
    department: 'Information Technology',
    bio: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInfo({ ...info, [name]: value });
  };

  const clearPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempPreview(URL.createObjectURL(file));
      setProfilePhoto(file);
    }
  };

  const applyPhoto = () => {
    if (tempPreview) {
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <EmpHeader />
      <div className={styles.container}>
        <div data-aos="fade-up" className={styles.contentSection}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>Profile Settings</h2>
          </div>

          <hr className={styles.separator} />
          <div className={styles.profileContainer}>
            <div className={styles.leftColumn}>
              {/* Profile Photo + Name */}
              <div className={styles.profileInfo}>
                <img
                  src={profilePhoto ? URL.createObjectURL(profilePhoto) : '/placeholder.png'}
                  alt="Profile"
                  className={styles.avatar}
                />
                <div className={styles.profileDetails}>
                  <h3 className={styles.name}>Kai Sotto</h3>
                  <p className={styles.role}>IT Coordinator</p>
                </div>
              </div>

              {/* Upload Photo Section */}
              <div className={styles.uploadSection}>
                <button className={styles.uploadBtn} onClick={() => setIsModalOpen(true)}>
                  Upload Photo
                </button>
                <p className={styles.photoNote}>Upload a professional photo to personalize your account.</p>
              </div>

              {/* Change Password Form */}
              <div className={styles.passwordSection}>
                <h3>Change Password</h3>
                <div className={styles.inputGroup}>
                  <label>Current password</label>
                  <input
                    type="password"
                    className={styles.inputField}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>New Password</label>
                  <input
                    type="password"
                    className={styles.inputField}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className={styles.inputField}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <button className={styles.clearBtn} onClick={clearPasswordFields}>Clear</button>
                  <button className={styles.saveBtn}>Change Password</button>
                </div>
              </div>
            </div>

            {/* Right Column: Information Section */}
            <div className={styles.rightColumn}>
              <div className={styles.infoSection}>
                <h3>Information</h3>
                <div className={styles.formGroup}>
                  <div className={styles.inputGroup}>
                    <label>First Name</label>
                    <input
                      className={styles.inputField}
                      name="firstName"
                      value={info.firstName}
                      onChange={handleInfoChange}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Last Name</label>
                    <input
                      className={styles.inputField}
                      name="lastName"
                      value={info.lastName}
                      onChange={handleInfoChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input
                      className={styles.inputField}
                      name="email"
                      value={info.email}
                      onChange={handleInfoChange}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Employee ID</label>
                    <input
                      className={styles.inputField}
                      name="employeeId"
                      value={info.employeeId}
                      onChange={handleInfoChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.inputGroup}>
                    <label>Mobile Number</label>
                    <input
                      className={styles.inputField}
                      name="mobile"
                      value={info.mobile}
                      onChange={handleInfoChange}
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Role</label>
                    <input
                      className={styles.inputField}
                      name="role"
                      value={info.role}
                      onChange={handleInfoChange}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Department</label>
                  <input
                    className={styles.inputField}
                    name="department"
                    value={info.department}
                    onChange={handleInfoChange}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Bio</label>
                  <textarea
                    className={styles.textareaField}
                    name="bio"
                    value={info.bio}
                    onChange={handleInfoChange}
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button className={styles.clearBtn}>Cancel</button>
                  <button className={styles.saveBtn}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Modal */}
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3>Upload Photo</h3>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</button>

              <div className={styles.previewBox}>
                {tempPreview ? (
                  <img src={tempPreview} alt="Preview" className={styles.previewImage} />
                ) : (
                  <p>No image selected.</p>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div className={styles.buttonGroup}>
                <button className={styles.clearBtn} onClick={() => fileInputRef.current?.click()}>
                  Change
                </button>
                <button className={styles.saveBtn} onClick={applyPhoto}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
