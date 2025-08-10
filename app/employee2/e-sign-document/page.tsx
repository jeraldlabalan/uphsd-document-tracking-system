"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Role, Signee, Placeholder } from "@/components/e-sign/types";
import styles from "./eSignDocument.module.css";
import Sidebar from "@/components/e-sign/sidebar/Sidebar";
import { PDFViewerRef } from "@/components/e-sign/types";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { useSearchParams, useRouter } from "next/navigation";

const PDFViewer = dynamic(
  () => import("@/components/e-sign/pdfViewer/PDFViewer"),
  { ssr: false }
);

export default function ESignDocument() {
  const viewerRef = useRef<PDFViewerRef>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState<Role>("sender");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const placeholderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [nextScrollIndex, setNextScrollIndex] = useState(0);
  const [hasSigned, setHasSigned] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "signed">("edit");
  const [draggingEnabled, setDraggingEnabled] = useState(false);
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);
  const [isDocumentCreator, setIsDocumentCreator] = useState(false);

  // Get document data from URL parameters
  const documentId = searchParams.get("docId");
  const documentTitle = searchParams.get("title");
  const documentType = searchParams.get("type");
  const department = searchParams.get("department");
  const approvers = searchParams.get("approvers");
  const uploadedFile = searchParams.get("file");
  const userRole = searchParams.get("userRole"); // New parameter for user role

  // Debug logging
  console.log("URL Parameters:", {
    documentId,
    documentTitle,
    documentType,
    department,
    approvers,
    uploadedFile,
    userRole
  });

  // Parse approvers from URL parameter
  const parsedApprovers: Signee[] = approvers ? JSON.parse(decodeURIComponent(approvers)) : [];

  // Create signees array including the sender
  const SIGNEES: Signee[] = [
    { id: "sender", name: "Document Sender" },
    ...parsedApprovers
  ];

  // If no approvers, add some default signees for testing
  if (SIGNEES.length === 1) {
    SIGNEES.push(
      { id: "default1", name: "Default Signee 1" },
      { id: "default2", name: "Default Signee 2" }
    );
  }

  // Debug logging for signees
  console.log("Parsed approvers:", parsedApprovers);
  console.log("Final SIGNEES:", SIGNEES);

  // Determine user role and load existing placeholders
  useEffect(() => {
    const determineUserRole = async () => {
      try {
        // Check if user is the document creator
        if (documentId) {
          const response = await fetch(`/api/employee/signature-placeholders?documentId=${documentId}`);
          if (response.ok) {
            const data = await response.json();
            const existingPlaceholders = data.placeholders.map((p: {
              PlaceholderID: number;
              Page: number;
              X: number;
              Y: number;
              Width: number;
              Height: number;
              AssignedTo: {
                UserID: number;
                FirstName: string;
                LastName: string;
              };
              IsSigned: boolean;
              SignedAt: string | null;
              AssignedToID: number;
            }) => ({
              id: p.PlaceholderID,
              placeholderId: p.PlaceholderID,
              page: p.Page,
              x: p.X,
              y: p.Y,
              width: p.Width,
              height: p.Height,
              signee: p.AssignedTo.UserID.toString(),
              signeeName: `${p.AssignedTo.FirstName} ${p.AssignedTo.LastName}`,
              isSigned: p.IsSigned,
              signedAt: p.SignedAt,
              assignedToId: p.AssignedToID,
            }));
            
            setPlaceholders(existingPlaceholders);
            
            // If placeholders exist, user is a receiver
            if (existingPlaceholders.length > 0) {
              // Check if user has any unsigned placeholders
              const userPlaceholders = existingPlaceholders.filter((p: Placeholder) => 
                p.signee === "current-user-id" && !p.isSigned
              );
              
              if (userPlaceholders.length > 0) {
                setRole("receiver");
                setIsDocumentCreator(false);
              } else {
                setRole("sender");
                setIsDocumentCreator(true);
              }
            } else {
              // No placeholders yet, user is the creator
              setRole("sender");
              setIsDocumentCreator(true);
            }
          }
        } else {
          // No document ID, user is creating a new document
          setRole("sender");
          setIsDocumentCreator(true);
        }
      } catch (error) {
        console.error("Error determining user role:", error);
        // Fallback to sender role
        setRole("sender");
        setIsDocumentCreator(true);
      }
    };

    determineUserRole();
  }, [documentId]);

  const jumpToNextSignature = () => {
    const remaining = placeholders.filter(
      (ph) => ph.signee === role && !ph.isSigned
    );
    const target = remaining[nextScrollIndex];

    if (target) {
      const ref = placeholderRefs.current[target.id];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setNextScrollIndex((prev) => (prev + 1) % remaining.length);
    }
  };

  // Handle file upload from CreateNewDocument
  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setOriginalPdfUrl(url);
    setPdfUrl(url);
  };

  // If we have a file URL from the search params, use it
  useEffect(() => {
    if (uploadedFile && uploadedFile.startsWith('blob:')) {
      setPdfUrl(uploadedFile);
      setOriginalPdfUrl(uploadedFile);
    }
  }, [uploadedFile]);

  // Handle saving signature placeholders (for sender)
  const handleSavePlaceholders = async (placeholdersToSave: Placeholder[]) => {
    console.log("handleSavePlaceholders called with:", {
      documentId,
      placeholdersToSave,
      placeholdersToSaveLength: placeholdersToSave.length
    });
    
    if (!documentId) {
      alert("Document ID is missing. Cannot save placeholders.");
      return;
    }

    try {
      // First, save placeholders to database
      const response = await fetch('/api/employee/signature-placeholders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: parseInt(documentId),
          placeholders: placeholdersToSave.map(p => ({
            page: p.page,
            x: p.x,
            y: p.y,
            width: p.width,
            height: p.height,
            assignedToId: p.assignedToId,
            signee: p.signee,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update placeholders with database IDs
        setPlaceholders(prev => prev.map((p, index) => ({
          ...p,
          placeholderId: result.placeholders[index]?.PlaceholderID || p.placeholderId,
        })));

        // Now generate PDF with placeholders and save it
        if (viewerRef.current) {
          const pdfWithPlaceholders = await viewerRef.current.generatePdfWithPlaceholders();
          
          if (pdfWithPlaceholders) {
            // Convert blob URL to File object for upload
            const response2 = await fetch(pdfWithPlaceholders);
            const blob = await response2.blob();
            const file = new File([blob], `with-placeholders-${documentTitle || 'document'}.pdf`, { type: 'application/pdf' });
            
            // Create FormData for upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentTitle', documentTitle || 'Untitled Document');
            formData.append('documentId', documentId);
            
            // Upload to backend
            const uploadResponse = await fetch('/api/employee/save-document-with-placeholders', {
              method: 'POST',
              body: formData,
            });
            
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              alert('Signature placeholders saved successfully! Document with placeholders has been saved. Signees will be notified.');
              
              // Store the new file URL for CreateNewDocument to access
              localStorage.setItem('documentWithPlaceholdersUrl', uploadResult.fileUrl);
              localStorage.setItem('documentWithPlaceholdersTitle', documentTitle || 'Untitled Document');
            } else {
              throw new Error('Failed to save document with placeholders');
            }
          }
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save placeholders');
      }
    } catch (error) {
      console.error('Error saving placeholders:', error);
      alert('Failed to save placeholders. Please try again.');
    }
  };

  // Handle saving the e-signed file (for receiver)
  const handleSaveFile = async () => {
    if (pdfUrl && pdfUrl !== originalPdfUrl) {
      try {
        // Convert blob URL to File object for upload
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const file = new File([blob], `e-signed-${documentTitle || 'document'}.pdf`, { type: 'application/pdf' });
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentTitle', documentTitle || 'Untitled Document');
        formData.append('documentId', documentId || '');
        
        // Upload to backend
        const uploadResponse = await fetch('/api/employee/e-sign-document', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          
          // Show success message
          alert('E-signed document has been saved successfully!');
          
          // Store the new file URL in localStorage for CreateNewDocument to access
          localStorage.setItem('eSignedDocumentUrl', result.fileUrl);
          localStorage.setItem('eSignedDocumentTitle', documentTitle || 'Untitled Document');
          
          // Close the current tab and return to CreateNewDocument
          window.close();
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error saving e-signed document:', error);
        alert('Failed to save e-signed document. Please try again.');
      }
    } else {
      alert('No changes detected. Please add signatures before saving.');
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    // In a real implementation, this would redirect to the user's dashboard
    // For now, we'll go back to the previous page
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to employee dashboard
      router.push('/employee2/dashboard');
    }
  };

  return (
    <div className={styles.container}>
      {isSidebarOpen && (
        <Sidebar
          hasSigned={hasSigned}
          role={role}
          signees={SIGNEES}
          onRoleChange={setRole}
          resetSignaturePreview={() =>
            viewerRef.current?.resetSignaturePreview()
          }
          onFileChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
          placeholders={placeholders}
          jumpToNextSignature={jumpToNextSignature}
          setModalOpen={setModalOpen}
          setDraggingEnabled={setDraggingEnabled}
          setViewMode={setViewMode}
          onSaveFile={handleSaveFile}
          onSavePlaceholders={handleSavePlaceholders}
          onBackToDashboard={handleBackToDashboard}
          documentId={documentId || undefined}
          isDocumentCreator={isDocumentCreator}
        />
      )}

      <div
        className={`${styles.mainContent} ${
          isSidebarOpen ? styles.withSidebar : styles.fullWidth
        }`}
      >
        <header className={styles.header}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 30 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.7017 15.3622L0.034668 2.69521L2.33339 0.396484L15.0004 13.0633L27.6673 0.396484L29.966 2.69521L17.2991 15.3622L29.966 28.029L27.6673 30.3279L15.0004 17.6609L2.33339 30.3279L0.034668 28.029L12.7017 15.3622Z"
                  fill="white"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 39 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.375 0.5H38.625V4.75H0.375V0.5ZM0.375 15.375H38.625V19.625H0.375V15.375ZM0.375 30.25H38.625V34.5H0.375V30.25Z"
                  fill="#F6ECEC"
                />
              </svg>
            )}
          </button>
          <Image src={logo} className={styles.headerLogo} alt="upshd logo" />
          <div className={styles.documentInfo}>
            <h3>{documentTitle || "Document"}</h3>
            <p>Type: {documentType || "N/A"} | Department: {department || "N/A"}</p>
          </div>
        </header>
        
        <div className={styles.pdfViewer}>
          {pdfUrl && (
            <PDFViewer
              ref={viewerRef}
              role={role}
              pdfUrl={pdfUrl}
              placeholders={placeholders}
              setPlaceholders={setPlaceholders}
              placeholderRefs={placeholderRefs}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              draggingEnabled={draggingEnabled}
              setDraggingEnabled={setDraggingEnabled}
              onApplyComplete={handleSaveFile}
              viewMode={viewMode}
              setViewMode={setViewMode}
              originalPdfUrl={originalPdfUrl}
              hasSigned={hasSigned}
              signees={SIGNEES}
              documentId={documentId || undefined}
              onSavePlaceholders={handleSavePlaceholders}
            />
          )}
        </div>
      </div>
    </div>
  );
}
