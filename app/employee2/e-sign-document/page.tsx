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
  const [isUndoing, setIsUndoing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [onOk, setOnOk] = useState<(() => void) | null>(null);
  const [onCancel, setOnCancel] = useState<(() => void) | null>(null);


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
  
  // Debug: Log the full URL to see what parameters are actually being passed
  useEffect(() => {
    console.log("Full URL:", window.location.href);
    console.log("Search params:", window.location.search);
    
    // Test API connectivity
    const testAPIConnectivity = async () => {
      try {
        console.log("🧪 Testing API connectivity...");
        
        // Test basic API endpoint
        const testResponse = await fetch('/api/user/me');
        console.log("✅ API connectivity test passed, status:", testResponse.status);
        
        if (testResponse.ok) {
          const userData = await testResponse.json();
          console.log("✅ Current user data:", userData);
        } else {
          console.error("❌ API test failed with status:", testResponse.status);
          const errorText = await testResponse.text();
          console.error("❌ Error response:", errorText);
        }
        
        // Test if we can access the uploads directory
        try {
          const uploadsTest = await fetch('/uploads/documents/', { method: 'HEAD' });
          console.log("📁 Uploads directory test status:", uploadsTest.status);
        } catch (error) {
          console.error("❌ Uploads directory test failed:", error);
        }
        
      } catch (error) {
        console.error("❌ API connectivity test failed:", error);
        setError(`API connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    testAPIConnectivity();
  }, []);

  // Parse approvers from URL parameter
  const parsedApprovers: Signee[] = approvers ? JSON.parse(decodeURIComponent(approvers)) : [];

  // Create signees array (excluding the sender)
  const SIGNEES: Signee[] = parsedApprovers.map(approver => ({
    id: approver.id, // Keep the user ID as the signee ID
    name: approver.name,
    userId: approver.userId // Store the database user ID separately
  }));

  // If no approvers, add some default signees for testing
  if (SIGNEES.length === 0) {
    SIGNEES.push(
      { id: "default1", name: "Default Signee 1" },
      { id: "default2", name: "Default Signee 2" }
    );
  }

  // Debug logging for signees
  console.log("Parsed approvers:", parsedApprovers);
  console.log("Final SIGNEES:", SIGNEES);
  console.log("Document ID:", documentId);
  console.log("User Role:", userRole);

  // Determine user role and load existing placeholders
  useEffect(() => {
    const determineUserRole = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("🔍 Starting user role determination...");
        
        // First check if userRole is explicitly set in URL params
        console.log("Checking userRole from URL params:", userRole);
        if (userRole === "receiver") {
          console.log("Setting role to receiver based on URL params");
          setRole("receiver");
          setIsDocumentCreator(false);
          
          // Load existing placeholders for receiver
          if (documentId && documentId !== "unknown") {
            console.log("Loading placeholders for receiver, documentId:", documentId);
            try {
              const response = await fetch(`/api/employee/signature-placeholders?documentId=${documentId}`);
              console.log("Placeholders API response status:", response.status);
              
              if (response.ok) {
                const data = await response.json();
                console.log("Placeholders loaded for receiver:", data.placeholders);
                const existingPlaceholders = data.placeholders
                  .filter((p: any) => !p.IsSigned && !p.IsDeleted) // Only load unsigned and non-deleted placeholders
                  .map((p: {
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
              } else {
                console.error("Failed to load placeholders, status:", response.status);
                const errorText = await response.text();
                console.error("Error response:", errorText);
                setError(`Failed to load placeholders: ${response.status} ${errorText}`);
              }
            } catch (error) {
              console.error("Error fetching placeholders:", error);
              setError(`Error fetching placeholders: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          return;
        }

        // Check if user is the document creator
        if (documentId && documentId !== "unknown") {
          console.log("Checking if user is document creator for documentId:", documentId);
          try {
            const response = await fetch(`/api/employee/signature-placeholders?documentId=${documentId}`);
            console.log("Signature placeholders API response status:", response.status);
            
            if (response.ok) {
              const data = await response.json();
              console.log("Signature placeholders data:", data);
              
              const existingPlaceholders = data.placeholders
                .filter((p: any) => !p.IsSigned && !p.IsDeleted) // Only load unsigned and non-deleted placeholders
                .map((p: {
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
                // We need to get the current user's ID to compare
                try {
                  const currentUserResponse = await fetch('/api/user/me');
                  console.log("Current user API response status:", currentUserResponse.status);
                  
                  if (currentUserResponse.ok) {
                    const currentUser = await currentUserResponse.json();
                    console.log("Current user data:", currentUser);
                    
                    const userPlaceholders = existingPlaceholders.filter((p: Placeholder) => 
                      p.assignedToId === currentUser.UserID && !p.isSigned
                    );
                    
                    if (userPlaceholders.length > 0) {
                      console.log("User has unsigned placeholders, setting role to receiver");
                      setRole("receiver");
                      setIsDocumentCreator(false);
                    } else {
                      console.log("User has no unsigned placeholders, setting role to sender");
                      setRole("sender");
                      setIsDocumentCreator(true);
                    }
                  } else {
                    console.error("Failed to get current user, status:", currentUserResponse.status);
                    // Fallback: if we can't get current user, assume sender
                    setRole("sender");
                    setIsDocumentCreator(true);
                  }
                } catch (error) {
                  console.error("Error fetching current user:", error);
                  // Fallback: if we can't get current user, assume sender
                  setRole("sender");
                  setIsDocumentCreator(true);
                }
              } else {
                // No placeholders yet, user is the creator
                console.log("No placeholders found, user is the creator");
                setRole("sender");
                setIsDocumentCreator(true);
              }
            } else {
              console.error("Failed to fetch signature placeholders, status:", response.status);
              const errorText = await response.text();
              console.error("Error response:", errorText);
              setError(`Failed to fetch signature placeholders: ${response.status} ${errorText}`);
              
              // Fallback to sender role
              setRole("sender");
              setIsDocumentCreator(true);
            }
          } catch (error) {
            console.error("Error fetching signature placeholders:", error);
            setError(`Error fetching signature placeholders: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Fallback to sender role
            setRole("sender");
            setIsDocumentCreator(true);
          }
        } else {
          // No document ID, user is creating a new document
          console.log("No document ID provided, user is creating a new document");
          setRole("sender");
          setIsDocumentCreator(true);
        }
      } catch (error) {
        console.error("Error determining user role:", error);
        setError(`Error determining user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Fallback to sender role
        setRole("sender");
        setIsDocumentCreator(true);
      } finally {
        setIsLoading(false);
      }
    };

    determineUserRole();
  }, [documentId, userRole]);

  const jumpToNextSignature = async () => {
    let remaining;
    if (role === "receiver") {
      // Get current user's ID to filter placeholders assigned to them
      let currentUserId: number | null = null;
      try {
        const userResponse = await fetch('/api/user/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          currentUserId = userData.UserID;
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
      
      // For receivers, show only unsigned placeholders assigned to them
      remaining = placeholders.filter(
        (ph) => !ph.isSigned && ph.assignedToId === currentUserId
      );
    } else {
      // For senders, show placeholders they created
      remaining = placeholders.filter(
        (ph) => ph.signee === role && !ph.isSigned
      );
    }
    
    console.log("jumpToNextSignature - remaining placeholders:", remaining);
    console.log("jumpToNextSignature - nextScrollIndex:", nextScrollIndex);
    
    const target = remaining[nextScrollIndex];

    if (target) {
      const ref = placeholderRefs.current[target.id];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setNextScrollIndex((prev) => (prev + 1) % remaining.length);
    } else {
      console.log("No target placeholder found for jumping");
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
    console.log("File loading useEffect triggered with uploadedFile:", uploadedFile);
    
    const loadFile = async () => {
      try {
        setError(null);
        
        if (uploadedFile) {
          console.log("Uploaded file param:", uploadedFile);
          
          // Handle different file URL formats
          let finalUrl = uploadedFile;
          
          if (uploadedFile.startsWith('blob:')) {
            // Local blob URL - use as is
            console.log("Using blob URL:", uploadedFile);
            setPdfUrl(uploadedFile);
            setOriginalPdfUrl(uploadedFile);
            return;
          } else if (uploadedFile.startsWith('/uploads/')) {
            // Server file path - convert to full URL
            finalUrl = `${window.location.origin}${uploadedFile}`;
            console.log("Converted server file path to URL:", finalUrl);
          } else if (uploadedFile.includes('uploads/documents/')) {
            // File path without leading slash - add it
            finalUrl = `${window.location.origin}/${uploadedFile}`;
            console.log("Converted documents file path to URL:", finalUrl);
          } else if (uploadedFile.includes('uploads/')) {
            // File path without leading slash - add it
            finalUrl = `${window.location.origin}/${uploadedFile}`;
            console.log("Converted uploads file path to URL:", finalUrl);
          } else {
            // Try to construct the full URL
            finalUrl = `${window.location.origin}/uploads/documents/${uploadedFile}`;
            console.log("Constructed file URL:", finalUrl);
          }
          
          // Test if the file is accessible
          try {
            console.log("Testing file accessibility for:", finalUrl);
            const testResponse = await fetch(finalUrl, { method: 'HEAD' });
            if (testResponse.ok) {
              console.log("✅ File is accessible:", finalUrl);
              setPdfUrl(finalUrl);
              setOriginalPdfUrl(finalUrl);
              return;
            } else {
              console.error("❌ File not accessible:", finalUrl, "Status:", testResponse.status);
            }
          } catch (error) {
            console.error("❌ Error testing file accessibility:", error);
          }
          
          // Try alternative path
          const altUrl = `${window.location.origin}/uploads/documents/${uploadedFile.split('/').pop()}`;
          console.log("Trying alternative URL:", altUrl);
          
          try {
            const altResponse = await fetch(altUrl, { method: 'HEAD' });
            if (altResponse.ok) {
              console.log("✅ Alternative URL works:", altUrl);
              setPdfUrl(altUrl);
              setOriginalPdfUrl(altUrl);
              return;
            } else {
              console.error("❌ Alternative URL also failed:", altUrl, "Status:", altResponse.status);
            }
          } catch (error) {
            console.error("❌ Error testing alternative URL:", error);
          }
          
          // If we get here, both URLs failed
          console.error("🚨 All file URLs failed, setting error state");
          setError("Failed to load document file. Please check if the file exists and try again.");
          setPdfUrl(null);
          setOriginalPdfUrl(null);
        } else if (documentId && documentId !== "unknown") {
          // If no uploadedFile but we have a documentId, try to fetch the file path from the API
          console.log("No uploadedFile provided, fetching from API for documentId:", documentId);
          try {
            const response = await fetch(`/api/employee/documents/${documentId}`);
            if (response.ok) {
              const data = await response.json();
              console.log("Document data from API:", data);
              
              if (data.latestVersion?.FilePath) {
                const filePath = data.latestVersion.FilePath;
                console.log("Found file path from API:", filePath);
                
                // Test the file path
                const fullUrl = `${window.location.origin}${filePath}`;
                console.log("Testing file URL from API:", fullUrl);
                
                try {
                  const testResponse = await fetch(fullUrl, { method: 'HEAD' });
                  if (testResponse.ok) {
                    console.log("✅ API file path is accessible:", fullUrl);
                    setPdfUrl(fullUrl);
                    setOriginalPdfUrl(fullUrl);
                    return;
                  } else {
                    console.error("❌ API file path not accessible:", fullUrl, "Status:", testResponse.status);
                  }
                } catch (error) {
                  console.error("❌ Error testing API file path:", error);
                }
                
                // Try alternative path
                const fileName = filePath.split('/').pop();
                const altUrl = `${window.location.origin}/uploads/documents/${fileName}`;
                console.log("Trying alternative API file URL:", altUrl);
                
                try {
                  const altResponse = await fetch(altUrl, { method: 'HEAD' });
                  if (altResponse.ok) {
                    console.log("✅ Alternative API URL works:", altUrl);
                    setPdfUrl(altUrl);
                    setOriginalPdfUrl(altUrl);
                    return;
                  } else {
                    console.error("❌ Alternative API URL also failed:", altUrl, "Status:", altResponse.status);
                  }
                } catch (error) {
                  console.error("❌ Error testing alternative API URL:", error);
                }
                
                // File doesn't exist - show helpful error message
                console.error("🚨 CRITICAL: File not found on filesystem:", fileName);
                console.error("This suggests a database-file mismatch. The file path in the database doesn't match what's on the filesystem.");
                
                setError(`Document file not found: ${fileName}. This suggests a database-file mismatch. Please contact the system administrator.`);
                // Set error state
                setPdfUrl(null);
                setOriginalPdfUrl(null);
              } else {
                console.log("No file path found in API response for document:", documentId);
                setError("No file path found for this document. Please contact the system administrator.");
                setPdfUrl(null);
                setOriginalPdfUrl(null);
              }
            } else {
              console.log("Failed to fetch document details from API, status:", response.status);
              setError(`Failed to fetch document details: ${response.status}. Please try again or contact support.`);
              setPdfUrl(null);
              setOriginalPdfUrl(null);
            }
          } catch (error) {
            console.error("Error fetching file path from API:", error);
            setError(`Error fetching document details: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setPdfUrl(null);
            setOriginalPdfUrl(null);
          }
        } else {
          console.log("No uploadedFile parameter provided and no documentId to fetch from");
          setError("No document file or ID provided. Please ensure you're accessing this page with proper parameters.");
          setPdfUrl(null);
          setOriginalPdfUrl(null);
        }
      } catch (error) {
        console.error("Unexpected error in loadFile:", error);
        setError(`Unexpected error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setPdfUrl(null);
        setOriginalPdfUrl(null);
      }
    };

    loadFile();
  }, [uploadedFile, documentId]);

  // Handle saving signature placeholders (for sender)
  const handleSavePlaceholders = async (placeholdersToSave: Placeholder[]) => {
  console.log("handleSavePlaceholders called with:", {
    documentId,
    placeholdersToSave,
    placeholdersToSaveLength: placeholdersToSave.length,
  });

  console.log("Current placeholders state:", placeholders);
  console.log("Placeholders to save:", placeholdersToSave);

  // If no documentId or documentId is "unknown", this is a new document being created
  if (!documentId || documentId === "unknown") {
    console.log("No documentId - saving to localStorage for new document");
    try {
      if (viewerRef.current) {
        const pdfWithoutPlaceholders = await viewerRef.current.generatePdfWithoutPlaceholders();

        if (pdfWithoutPlaceholders) {
          console.log("PDF without embedded placeholders generated successfully");

          const response = await fetch(pdfWithoutPlaceholders);
          const blob = await response.blob();
          const reader = new FileReader();

          reader.onload = () => {
            const base64Data = reader.result as string;

            // Store metadata in localStorage
            localStorage.setItem("documentWithPlaceholdersData", base64Data);
            localStorage.setItem("documentWithPlaceholdersTitle", documentTitle || "Untitled Document");
            localStorage.setItem("documentWithPlaceholdersId", "new");
            localStorage.setItem("documentWithPlaceholdersType", documentType || "Unknown Type");
            localStorage.setItem("documentWithPlaceholdersDepartment", department || "Unknown Department");
            localStorage.setItem("documentWithPlaceholdersApprovers", approvers || "");
            localStorage.setItem("documentWithPlaceholdersDescription", "");
            localStorage.setItem("documentWithPlaceholdersPlaceholders", JSON.stringify(placeholdersToSave));

            // ✅ Show success modal instead of alert
            setModalMessage(
              "Signature placeholders saved successfully! Document saved with placeholders stored in database. Signees will be notified. Redirecting back to document page..."
            );
            setOnOk(() => () => {
              setTimeout(() => window.close(), 2000);
            });
            setOnCancel(null);
            setShowModal(true);
          };

          reader.readAsDataURL(blob);
        } else {
          console.error("Failed to generate PDF with placeholders");
          setModalMessage("Failed to generate PDF with placeholders. Please try again.");
          setOnOk(null);
          setOnCancel(null);
          setShowModal(true);
        }
      } else {
        console.error("PDFViewer ref is not available");
        setModalMessage("PDF viewer is not available. Please try again.");
        setOnOk(null);
        setOnCancel(null);
        setShowModal(true);
      }
      return;
    } catch (error) {
      console.error("Error saving placeholders for new document:", error);
      setModalMessage("Failed to save placeholders. Please try again.");
      setOnOk(null);
      setOnCancel(null);
      setShowModal(true);
      return;
    }
  }

  try {
    // Save placeholders to database
    const response = await fetch("/api/employee/signature-placeholders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId: parseInt(documentId),
        placeholders: placeholdersToSave.map((p) => ({
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

      setPlaceholders((prev) =>
        prev.map((p, index) => ({
          ...p,
          placeholderId: result.placeholders[index]?.PlaceholderID || p.placeholderId,
        }))
      );

      if (viewerRef.current) {
        const pdfWithoutPlaceholders = await viewerRef.current.generatePdfWithoutPlaceholders();

        if (pdfWithoutPlaceholders) {
          const response2 = await fetch(pdfWithoutPlaceholders);
          const blob = await response2.blob();
          const file = new File([blob], `with-placeholders-${documentTitle || "document"}.pdf`, {
            type: "application/pdf",
          });

          const formData = new FormData();
          formData.append("file", file);
          formData.append("documentTitle", documentTitle || "Untitled Document");
          formData.append("documentId", documentId);

          const uploadResponse = await fetch("/api/employee/save-document-with-placeholders", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();

            localStorage.setItem("documentWithPlaceholdersUrl", uploadResult.fileUrl);
            localStorage.setItem("documentWithPlaceholdersTitle", documentTitle || "Untitled Document");
            localStorage.setItem("documentWithPlaceholdersId", documentId);
            localStorage.setItem("documentWithPlaceholdersType", documentType || "Unknown Type");
            localStorage.setItem("documentWithPlaceholdersDepartment", department || "Unknown Department");
            localStorage.setItem("documentWithPlaceholdersApprovers", approvers || "");
            localStorage.setItem("documentWithPlaceholdersDescription", "");
            localStorage.setItem("documentWithPlaceholdersPlaceholders", JSON.stringify(placeholdersToSave));

            // ✅ Show success modal instead of alert
            setModalMessage(
              "Signature placeholders saved successfully! Document with placeholders has been saved. Signees will be notified. Redirecting back to document page..."
            );
            setOnOk(() => () => {
              setTimeout(() => window.close(), 2000);
            });
            setOnCancel(null);
            setShowModal(true);
          } else {
            throw new Error("Failed to save document with placeholders");
          }
        }
      }
    } else {
      const error = await response.json();
      throw new Error(error.message || "Failed to save placeholders");
    }
  } catch (error) {
    console.error("Error saving placeholders:", error);
    setModalMessage("Failed to save placeholders. Please try again.");
    setOnOk(null);
    setOnCancel(null);
    setShowModal(true);
  }
};

  // Handle saving the e-signed file (for receiver)
  const handleSaveFile = async () => {
  let currentUserId: number | null = null;
  try {
    const userResponse = await fetch('/api/user/me');
    if (userResponse.ok) {
      const userData = await userResponse.json();
      currentUserId = userData.UserID;
    }
  } catch (error) {
    console.error("Error fetching current user:", error);
  }

  const userSignedPlaceholders = placeholders.filter(
    (p) => p.isSigned && p.assignedToId === currentUserId
  );
  const hasAnySignatures = userSignedPlaceholders.length > 0;

  console.log("handleSaveFile called - userSignedPlaceholders:", userSignedPlaceholders);
  console.log("handleSaveFile called - hasAnySignatures:", hasAnySignatures);
  console.log("handleSaveFile called - pdfUrl:", pdfUrl);
  console.log("handleSaveFile called - originalPdfUrl:", originalPdfUrl);

  if (hasAnySignatures || (pdfUrl && pdfUrl !== originalPdfUrl)) {
    try {
      if (!pdfUrl) {
        console.error("No PDF URL available for saving");
        setModalMessage("No PDF available to save. Please try again.");
        setOnOk(null);
        setOnCancel(null);
        setShowModal(true);
        return;
      }

      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const file = new File([blob], `e-signed-${documentTitle || 'document'}.pdf`, {
        type: 'application/pdf',
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentTitle', documentTitle || 'Untitled Document');
      formData.append('documentId', documentId || '');

      const uploadResponse = await fetch('/api/employee/e-sign-document', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();

        // ✅ Show success modal instead of alert
        setModalMessage("E-signed document has been saved successfully!");
        setOnOk(() => () => {
          localStorage.setItem('eSignedDocumentUrl', result.fileUrl);
          localStorage.setItem('eSignedDocumentTitle', documentTitle || 'Untitled Document');
          window.close();
        });
        setOnCancel(null);
        setShowModal(true);

      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error saving e-signed document:', error);
      setModalMessage('Failed to save e-signed document. Please try again.');
      setOnOk(null);
      setOnCancel(null);
      setShowModal(true);
    }
  } else {
    setModalMessage('No changes detected. Please add signatures before saving.');
    setOnOk(null);
    setOnCancel(null);
    setShowModal(true);
  }
};

  // Handle back to dashboard
  const handleBackToDashboard = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    router.push('/employee2/dashboard');
  }
};

// Handle undo changes using modal
const handleUndoChanges = async () => {
  if (!documentId) {
    console.error('No document ID available for undo operation');
    return;
  }

  // Show confirmation modal instead of window.confirm
  setModalMessage(
    'Are you sure you want to undo all signatures? This action will:\n\n' +
    '• Remove all signatures from the document\n' +
    '• Revert the document to its unsigned state\n' +
    '• Reset the document status\n\n' +
    'This action cannot be undone. Continue?'
  );
  
  setOnOk(() => async () => {
    setShowModal(false);
    setIsUndoing(true);

    try {
      const response = await fetch('/api/employee/undo-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to undo signatures');
      }

      const result = await response.json();
      console.log('Signatures undone successfully:', result);

      setHasSigned(false);
      if (originalPdfUrl) setPdfUrl(originalPdfUrl);

      if (result.placeholders) {
        const uiPlaceholders = result.placeholders.map((ph: any) => ({
          id: ph.PlaceholderID,
          placeholderId: ph.PlaceholderID,
          page: ph.Page - 1,
          x: ph.X,
          y: ph.Y,
          width: ph.Width,
          height: ph.Height,
          signee: ph.AssignedToID.toString(),
          signeeName: ph.AssignedTo?.FirstName + ' ' + ph.AssignedTo?.LastName,
          isSigned: ph.IsSigned,
          signedAt: ph.SignedAt,
          assignedToId: ph.AssignedToID,
        }));
        setPlaceholders(uiPlaceholders);
        console.log('Placeholders restored from database:', uiPlaceholders);
      }

      setViewMode('edit');

      // Show success modal
      setModalMessage('Signatures undone successfully. Document has been reverted to unsigned state.');
      setOnOk(() => () => {
        window.location.reload();
      });
      setOnCancel(null);
      setShowModal(true);

    } catch (error) {
      console.error('Error undoing signatures:', error);
      setModalMessage(`Failed to undo signatures: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setOnOk(null);
      setOnCancel(null);
      setShowModal(true);
    } finally {
      setIsUndoing(false);
    }
  });

  setOnCancel(() => () => setShowModal(false));
  setShowModal(true);
};

  const handleApplyComplete = (signedUrl: string) => {
  console.log("onApplyComplete called with signedUrl:", signedUrl);

  // Update PDF URL with signed version
  setPdfUrl(signedUrl);
  setHasSigned(true);
  console.log("PDF URL updated and hasSigned set to true");

  // Remove all placeholders from UI state immediately
  console.log("Removing all placeholders from UI state");
  setPlaceholders([]);
  console.log("Placeholders removed from UI state");

  // Show success modal
  setModalMessage('E-signature has been successfully applied to the document.');
  setOnOk(() => () => {
    setShowModal(false); // Close modal on OK
  });
  setOnCancel(null);
  setShowModal(true);

  // Additional debugging
  console.log("State after signature application:");
  console.log("- hasSigned:", true);
  console.log("- placeholders count:", 0);
  console.log("- pdfUrl updated to:", signedUrl);
};


  return (
    <div className={styles.mainContainer}>
      {/* Left Sidebar */}
      <div className={styles.sidebar}>
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
          onUndoChanges={handleUndoChanges}
          isUndoing={isUndoing}
        />
      </div>

      {/* Right Content Area */}
      <div className={styles.contentArea}>
        {/* Header */}
        {/* <Header /> */}
        
        {/* PDF Viewer Container */}
        <div className={styles.pdfViewerContainer}>
          {/* Show error message if no PDF URL is available */}
          {!pdfUrl && (
            <div className={styles.errorContainer}>
              {isLoading ? (
                <div className={styles.loadingContainer}>
                  <h3>🔄 Loading Document...</h3>
                  <p>Please wait while we load your document...</p>
                  <div className={styles.spinner}></div>
                </div>
              ) : error ? (
                <div>
                  <h3>⚠️ Error Loading Document</h3>
                  <p><strong>Issue:</strong> {error}</p>
                  
                  {documentId && documentId !== "unknown" ? (
                    <div>
                      <p><strong>Document ID:</strong> {documentId}</p>
                      <p><strong>Possible Causes:</strong></p>
                      <ul>
                        <li>The file was not properly uploaded</li>
                        <li>The file path is incorrect</li>
                        <li>There's a server configuration issue</li>
                      </ul>
                    </div>
                  ) : (
                    <p>No document ID provided. Please try uploading a document again.</p>
                  )}
                  
                  <div className={styles.errorActions}>
                    <button onClick={() => window.location.reload()}>
                      🔄 Refresh Page
                    </button>
                    <button onClick={() => router.back()}>
                      ← Go Back
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3>📄 No Document Selected</h3>
                  <p>Please upload a PDF document to get started.</p>
                  <div className={styles.errorActions}>
                    <button onClick={() => router.push('/employee2/create-new-doc')}>
                      ➕ Create New Document
                    </button>
                    <button onClick={() => router.push('/employee2/documents')}>
                      📁 Browse Documents
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PDF Viewer */}
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
              onApplyComplete={handleApplyComplete}
              viewMode={viewMode}
              setViewMode={setViewMode}
              originalPdfUrl={originalPdfUrl}
              hasSigned={hasSigned}
              signees={SIGNEES}
              documentId={documentId || undefined}
              onSavePlaceholders={handleSavePlaceholders}
              setPdfUrl={setPdfUrl}
              setHasSigned={setHasSigned}
            />
          )}
        </div>
      </div>

      {showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.deletemodalContent}>
      <p>{modalMessage}</p>
      <div className={styles.modalActions}>
        {onCancel && (
          <button
            className={styles.cancelButton}
            onClick={() => {
              onCancel();
              setShowModal(false);
            }}
          >
            Cancel
          </button>
        )}
        <button
          className={styles.OKButton}
          onClick={() => {
            if (onOk) onOk();
            setShowModal(false);
          }}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
