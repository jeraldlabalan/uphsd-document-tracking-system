"use client";

import { useState, useEffect } from "react";
import styles from "./empDashboardStyles.module.css";

interface PendingDocument {
  documentId: number;
  title: string;
  type: string;
  department: string;
  creator: string;
  creatorEmail: string;
  createdAt: string;
  latestVersion: {
    versionID: number;
    versionNumber: number;
    filePath: string;
  } | null;
  placeholders: Array<{
    placeholderId: number;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export default function PendingSignatures() {
  console.log("PendingSignatures component rendering");
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingSignatures();
  }, []);

  // Debug: Log when pendingDocuments state changes
  useEffect(() => {
    console.log("PendingSignatures component - pendingDocuments updated:", pendingDocuments);
  }, [pendingDocuments]);

  const fetchPendingSignatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employee/pending-signatures');
      
      if (response.ok) {
        const data = await response.json();
        console.log("Pending signatures API response:", data);
        console.log("Pending documents:", data.pendingDocuments);
        setPendingDocuments(data.pendingDocuments);
      } else {
        throw new Error('Failed to fetch pending signatures');
      }
    } catch (error) {
      console.error('Error fetching pending signatures:', error);
      setError('Failed to load pending signatures');
    } finally {
      setLoading(false);
    }
  };

  const handleSignDocument = (document: PendingDocument) => {
    console.log("handleSignDocument called with document:", document);
    console.log("latestVersion:", document.latestVersion);
    
    // Navigate to e-sign document page with the document data
    const queryParams = new URLSearchParams({
      docId: document.documentId.toString(),
      title: document.title,
      type: document.type,
      department: document.department,
      userRole: 'receiver',
    });
    
    // If we have a latest version, add the file URL
    if (document.latestVersion?.filePath) {
      console.log("Adding file path:", document.latestVersion.filePath);
      queryParams.append('uploadedFile', document.latestVersion.filePath);
    } else {
      console.log("No file path found in latestVersion");
    }
    
    const finalUrl = `/employee2/e-sign-document?${queryParams.toString()}`;
    console.log("Opening URL:", finalUrl);
    window.open(finalUrl, '_blank');
  };

  if (loading) {
    return (
      <div className={styles.pendingSignaturesContainer}>
        <div className={styles.loadingSpinner}>Loading pending signatures...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pendingSignaturesContainer}>
        <div className={styles.errorMessage}>{error}</div>
        <button onClick={fetchPendingSignatures} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (pendingDocuments.length === 0) {
    return (
      <div className={styles.pendingSignaturesContainer}>
        <div className={styles.noPendingSignatures}>
          <h3>No Pending Signatures</h3>
          <p>You don't have any documents waiting for your signature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pendingSignaturesContainer}>
      <h3>Documents Pending Your Signature</h3>
      <div className={styles.pendingDocumentsList}>
        {pendingDocuments.map((document) => (
          <div key={document.documentId} className={styles.pendingDocumentCard}>
            <div className={styles.documentHeader}>
              <h4>{document.title}</h4>
              <span className={styles.documentType}>{document.type}</span>
            </div>
            
            <div className={styles.documentDetails}>
              <p><strong>Department:</strong> {document.department}</p>
              <p><strong>Created by:</strong> {document.creator}</p>
              <p><strong>Created:</strong> {new Date(document.createdAt).toLocaleDateString()}</p>
              <p><strong>Signatures needed:</strong> {document.placeholders.length}</p>
            </div>
            
            <div className={styles.documentActions}>
              <button
                onClick={() => {
                  console.log("Sign Document button clicked for document:", document);
                  handleSignDocument(document);
                }}
                className={styles.signDocumentButton}
              >
                Sign Document
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
