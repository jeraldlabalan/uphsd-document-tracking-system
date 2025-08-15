"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./empDashboardStyles.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchPendingSignatures();
  }, []);

  const fetchPendingSignatures = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/employee/pending-signatures");
      if (response.ok) {
        const data = await response.json();
        setPendingDocuments(data.pendingDocuments || []);
      } else {
        throw new Error("Failed to fetch pending signatures");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load pending signatures");
    } finally {
      setLoading(false);
    }
  };

  const handleSignDocument = (document: PendingDocument) => {
    const queryParams = new URLSearchParams({
      docId: document.documentId.toString(),
      title: document.title,
      type: document.type,
      department: document.department,
      userRole: "receiver",
    });
    if (document.latestVersion?.filePath) {
      queryParams.append("uploadedFile", document.latestVersion.filePath);
    }
    const finalUrl = `/employee2/e-sign-document?${queryParams.toString()}`;
    window.open(finalUrl, "_blank");
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <div className={styles.pendingSignaturesContainer}>
        <div className={styles.loadingSpinner}>Loading pending signatures...</div>
      </div>
    );

  if (error)
    return (
      <div className={styles.pendingSignaturesContainer}>
        <div className={styles.errorMessage}>{error}</div>
        <button onClick={fetchPendingSignatures} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );

  if (pendingDocuments.length === 0)
    return (
      <div className={styles.pendingSignaturesContainer}>
        <div className={styles.noPendingSignatures}>
          <h3>No Pending Signatures</h3>
          <p>You don't have any documents waiting for your signature.</p>
        </div>
      </div>
    );

  return (
    <div className={styles.pendingSignaturesContainer}>
      <h3>Documents Pending Your Signature</h3>
      <div className={styles.scrollWrapper}>
        <div className={styles.scrollButtonLeft} onClick={scrollLeft}>
          <ChevronLeft size={24} />
        </div>

        <div ref={scrollRef} className={styles.pendingDocumentsList}>
          {pendingDocuments.map((document) => (
            <div key={document.documentId} className={styles.pendingDocumentCard}>
              <div className={styles.documentHeader}>
                <h4>{document.title}</h4>
                <span className={styles.documentType}>{document.type}</span>
              </div>
              <div className={styles.documentDetails}>
                <p>
                  <strong className={styles.highlight}>Department:</strong> {document.department}
                </p>
                <p>
                  <strong className={styles.highlight}>Created by:</strong> {document.creator}
                </p>
                <p>
                  <strong className={styles.highlight}>Created:</strong>{" "}
                  {new Date(document.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong className={styles.highlight}>Signatures needed:</strong> {document.placeholders.length}
                </p>
              </div>
              <div className={styles.documentActions}>
                <button
                  onClick={() => handleSignDocument(document)}
                  className={styles.signDocumentButton}
                >
                  Sign Document
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.scrollButtonRight} onClick={scrollRight}>
          <ChevronRight size={24} />
        </div>
      </div>
    </div>
  );
}
