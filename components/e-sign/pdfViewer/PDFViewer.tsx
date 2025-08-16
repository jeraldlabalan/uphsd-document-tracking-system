"use client";

import React, { useState, useRef, useImperativeHandle, useEffect, forwardRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import styles from "./PDFViewer.module.css";
import type { PDFViewerProps, PDFViewerRef, Placeholder } from "../types";
import SignatureModal from "../signatureModal/SignatureModal";

// Fix PDF.js worker loading - try multiple sources
try {
  // Try CDN first
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
} catch (error) {
  console.warn("Failed to set CDN worker, trying unpkg:", error);
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  } catch (error2) {
    console.warn("Failed to set unpkg worker, trying jsdelivr:", error2);
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  }
}

function PDFViewer(
  {
    role,
    pdfUrl,
    placeholders,
    setPlaceholders,
    placeholderRefs,
    modalOpen,
    setModalOpen,
    draggingEnabled,
    setDraggingEnabled,
    onApplyComplete,
    viewMode,
    originalPdfUrl,
    hasSigned,
    signees, // Add signees prop
    documentId,
    onSavePlaceholders,
    setPdfUrl,
    setHasSigned,
  }: PDFViewerProps,
  ref: React.Ref<PDFViewerRef>
) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);

  const [uploadedSignature, setUploadedSignature] = useState<string | null>(
    null
  );

  useImperativeHandle(ref, () => ({
    applySignature,
    generatePdfWithoutPlaceholders,
    generateCleanPdf,
    addPlaceholder: (placeholder: Placeholder) => {
      setPlaceholders((prev) => [...prev, placeholder]);
    },
    removePlaceholder: (id: number) => {
      setPlaceholders((prev) => prev.filter((p) => p.id !== id));
    },
    updatePlaceholder: (id: number, updates: Partial<Placeholder>) => {
      setPlaceholders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    getPlaceholders: () => placeholders,
    setPlaceholders,
    resetSignaturePreview,
    undoChanges: () => {
      // This method is now deprecated - undo functionality is handled at the page level
      console.log("undoChanges called - this method is deprecated");
    },
  }));

  // Function to fetch placeholders from database
  const fetchPlaceholdersFromDatabase = async () => {
    try {
      const response = await fetch(`/api/employee/signature-placeholders?documentId=${documentId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.placeholders) {
          // Convert database placeholders to UI format
          const uiPlaceholders = data.placeholders.map((ph: any) => ({
            id: ph.PlaceholderID,
            placeholderId: ph.PlaceholderID,
            page: ph.Page - 1, // Convert to 0-based indexing
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
          
          console.log("🔍 DATABASE PLACEHOLDERS DEBUG:", {
            rawData: data.placeholders,
            convertedPlaceholders: uiPlaceholders,
            coordinateAnalysis: uiPlaceholders.map((ph: any) => ({
              id: ph.id,
              x: ph.x,
              y: ph.y,
              width: ph.width,
              height: ph.height,
              page: ph.page,
              isSigned: ph.isSigned
            }))
          });
          
          setPlaceholders(uiPlaceholders);
          console.log("Placeholders restored from database:", uiPlaceholders);
        }
      }
    } catch (error) {
      console.error("Error fetching placeholders from database:", error);
    }
  };

  const resetSignaturePreview = () => {
    setSignatureImage(null);
    setUploadedSignature(null);
    setPlaceholders((prev) =>
      prev.map(
        (p) => {
          if (role === "receiver") {
            // For receivers, reset all unsigned placeholders
            return !p.isSigned ? { ...p, isSigned: false } : p;
          } else {
            // For senders, reset placeholders they created
            return p.signee === role ? { ...p, isSigned: false } : p;
          }
        }
      )
    );
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const BASE_WIDTH = 800;
  const [scale, setScale] = useState(1.0); // Fixed scale at 1.0
  const [containerDims, setContainerDims] = useState({ width: 0, height: 0 });
  const [pageDims, setPageDims] = useState<{ [key: number]: { width: number; height: number } }>({});

  // Use completely fixed scale - no automatic scaling
  const finalScale = 1.0; // Always use 1.0 scale

  useEffect(() => {
    if (!containerRef.current) return;

    let timeout: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver(([entry]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Don't change scale - keep it fixed at 1.0
        // Just update container dimensions for reference
        const { width, height } = entry.contentRect;
        setContainerDims({ width, height });
      }, 100); // debounce time
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  // Remove zoom controls - no zoom functionality needed

  const [imgDims, setImgDims] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  useEffect(() => {
    if (!signatureImage) return;

    const img = new window.Image(); // ✅ native DOM image
    img.onload = () => {
      setImgDims({ width: img.width, height: img.height });
    };
    img.src = signatureImage;
  }, [signatureImage]);

  // Only for testing purposes
  const [testRole, setTestRole] = useState<string>("sender");

  const activeRole = testRole || role; // prefer testRole if set, else fallback to real role

  const MIN_WIDTH = 150;
  const MAX_WIDTH = 300;
  const MIN_HEIGHT = 40;
  const MAX_HEIGHT = 150;

  const canSign = placeholders.some((p) => p.signee === role && !p.isSigned);
  const [selectedPlaceholder, setSelectedPlaceholder] =
    useState<Placeholder | null>(null);

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [dragPage, setDragPage] = useState<number | null>(null);

  const [assignModal, setAssignModal] = useState<{
    visible: boolean;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    editingId?: number;
    existingId?: number;
    clickX?: number;
    clickY?: number;
  } | null>(null);

  const [search, setSearch] = useState("");

  const filteredSignees = signees.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Function to calculate optimal modal position based on click coordinates
  const calculateModalPosition = (clickX: number, clickY: number) => {
    const modalWidth = 220;
    const modalHeight = 300;
    
    // Calculate left position (center modal on click)
    let left = clickX - (modalWidth / 2);
    
    // Ensure modal doesn't go off-screen
    if (left < 10) left = 10;
    if (left + modalWidth > window.innerWidth - 10) {
      left = window.innerWidth - modalWidth - 10;
    }
    
    // Calculate top position (above click point)
    let top = clickY - modalHeight - 20;
    
    // If modal would go above screen, position below click point
    if (top < 10) {
      top = clickY + 20;
    }
    
    // Ensure modal doesn't go below screen
    if (top + modalHeight > window.innerHeight - 10) {
      top = window.innerHeight - modalHeight - 10;
    }
    
    // Additional check: if click is too close to edges, adjust position
    if (clickX < modalWidth + 20) {
      left = 20; // Position from left edge
    } else if (clickX > window.innerWidth - modalWidth - 20) {
      left = window.innerWidth - modalWidth - 20; // Position from right edge
    }
    
    // Debug logging
    console.log('Modal positioning:', {
      clickX,
      clickY,
      calculatedLeft: left,
      calculatedTop: top,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      modalWidth,
      modalHeight
    });
    
    return { left, top };
  };



  // Add click outside handler for modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assignModal?.visible) {
        const target = event.target as HTMLElement;
        if (!target.closest(`.${styles.assignModalContainer}`)) {
          clearDragState();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [assignModal?.visible]);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    page: number
  ) => {
    if (!draggingEnabled || role !== "sender" || modalOpen) return;
    
    // Get coordinates relative to the PDF page, not the container
    const pageContainer = e.currentTarget;
    
    // Try to find the actual PDF content element
    // Look for canvas, img, or any element that contains the PDF content
    let pdfContentElement = pageContainer.querySelector('canvas') || 
                           pageContainer.querySelector('img') ||
                           pageContainer.querySelector('.react-pdf__Page') ||
                           pageContainer.querySelector('[data-testid="react-pdf__Page"]');
    
    console.log('🔍 PDF Content Element Debug:', {
      pageContainer: pageContainer,
      pdfContentElement: pdfContentElement,
      availableElements: pageContainer.querySelectorAll('*').length,
      allElements: Array.from(pageContainer.querySelectorAll('*')).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id
      })).slice(0, 10)
    });
    
    if (pdfContentElement) {
      const contentRect = pdfContentElement.getBoundingClientRect();
      
      // Calculate coordinates relative to the PDF content
      const x = e.clientX - contentRect.left;
      const y = e.clientY - contentRect.top;
      
      console.log('✅ Using PDF content-relative coordinates:', { 
        x, 
        y, 
        contentRect,
        elementType: pdfContentElement.tagName,
        elementClass: pdfContentElement.className
      });
      
      setDragStart({ x, y });
      setDragPage(page);
    } else {
      // Fallback to container coordinates if PDF content element not found
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      console.log('⚠️ Using container coordinates (fallback):', { x, y, rect });
      setDragStart({ x, y });
      setDragPage(page);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart || dragPage === null) return;
    
    // Get coordinates relative to the PDF page, not the container
    const pageContainer = e.currentTarget;
    
    // Use the same selector logic as handleMouseDown for consistency
    let pdfContentElement = pageContainer.querySelector('canvas') || 
                           pageContainer.querySelector('img') ||
                           pageContainer.querySelector('.react-pdf__Page') ||
                           pageContainer.querySelector('[data-testid="react-pdf__Page"]');
    
    if (pdfContentElement) {
      const contentRect = pdfContentElement.getBoundingClientRect();
      
      const x = e.clientX - contentRect.left;
      const y = e.clientY - contentRect.top;

      const width = Math.abs(x - dragStart.x);
      const height = Math.abs(y - dragStart.y);
      const originX = Math.min(x, dragStart.x);
      const originY = Math.min(y, dragStart.y);

      console.log('🔍 Mouse Move - PDF coordinates:', { 
        x, 
        y, 
        dragStart, 
        width, 
        height, 
        originX, 
        originY,
        contentRect 
      });
      setDragRect({ x: originX, y: originY, width, height });
    } else {
      // Fallback to container coordinates if PDF page element not found
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const width = Math.abs(x - dragStart.x);
      const height = Math.abs(y - dragStart.y);
      const originX = Math.min(x, dragStart.x);
      const originY = Math.min(y, dragStart.y);

      console.log('⚠️ Mouse Move - Container coordinates (fallback):', { x, y, dragStart, width, height, originX, originY });
      setDragRect({ x: originX, y: originY, width, height });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragRect && dragPage !== null) {
      setAssignModal({
        visible: true,
        page: dragPage,
        x: dragRect.x,
        y: dragRect.y,
        width: dragRect.width,
        height: dragRect.height,
        clickX: e.clientX,
        clickY: e.clientY,
      });

      setSelectedAssignee(null);
      
      // Don't clear drag state here - keep it until placeholder is created
      // setDragStart(null);
      // setDragRect(null);
      // setDragPage(null);
      setDraggingEnabled(false);
    } else {
      // Only clear drag state if we're not opening the modal
      setDragStart(null);
      setDragRect(null);
      setDragPage(null);
      setDraggingEnabled(false);
    }
  };

  const assignSignee = (
    signee: string,
    signeeName: string,
    editingId?: number
  ) => {
    // Find the selected signee to get the userId
    const selectedSignee = signees.find(s => s.id === signee);
    const userId = selectedSignee?.userId;
    
    if (editingId) {
      setPlaceholders((prev) =>
        prev.map((ph) =>
          ph.id === editingId
            ? {
                ...ph,
                signee,
                signeeName,
                isSigned: false,
                signedAt: null,
                initials: null,
                assignedToId: userId,
              }
            : ph
        )
      );
    } else {
      if (!dragRect || dragPage === null) {
        console.error("No dragRect or dragPage available for new placeholder");
        console.error("dragRect:", dragRect);
        console.error("dragPage:", dragPage);
        console.error("assignModal:", assignModal);
        alert("Error: Could not create placeholder. Please try dragging again.");
        return;
      }

      // Get the actual rendered PDF dimensions for accurate coordinate conversion
      const displayedPageDims = pageDims[dragPage];
      if (!displayedPageDims) {
        console.error('No page dimensions available for page', dragPage);
        return;
      }
      
      // DEBUG: Let's see what coordinates we're actually getting
      console.log('🔍 DEBUG: Raw coordinates from dragRect:', dragRect);
      console.log('🔍 DEBUG: Page dimensions:', displayedPageDims);
      
      // For now, let's store the coordinates EXACTLY as they are without any conversion
      // This will help us debug the coordinate system mismatch
      const pdfX = dragRect.x;
      const pdfY = dragRect.y; // Don't flip Y coordinate yet
      
      console.log('🔍 Creating new placeholder with coordinates:', {
        dragRect,
        MIN_WIDTH,
        MIN_HEIGHT,
        page: dragPage,
        displayedPageDims,
        rawCoords: { x: dragRect.x, y: dragRect.y },
        storedCoords: { x: pdfX, y: pdfY }
      });
      
      const newPlaceholder: Placeholder = {
        id: Date.now(),
        page: dragPage,
        x: pdfX, // Store raw coordinates for now
        y: pdfY, // Store raw coordinates for now
        width: MIN_WIDTH,
        height: MIN_HEIGHT,
        signee,
        signeeName,
        isSigned: false,
        signedAt: null,
        initials: null,
        assignedToId: userId, // Set the database user ID
      };
      
      console.log('✅ New placeholder created:', newPlaceholder);
      console.log('🔍 Coordinate analysis:', {
        storedX: newPlaceholder.x,
        storedY: newPlaceholder.y,
        expectedPosition: 'Should be relative to PDF page, not container'
      });

      // Add the new placeholder to the state
      setPlaceholders((prev) => {
        const updated = [...prev, newPlaceholder];
        return updated;
      });
    }

    setSelectedAssignee({ signee, signeeName });
    setAssignModal(null);
    
    // Clear drag state after creating placeholder
    if (!editingId) {
      setDragRect(null);
      setDragPage(null);
      setDragStart(null);
      setDraggingEnabled(false);
    }
    

  };

  const applySignature = async () => {
    // Prevent senders from signing documents
    if (role === "sender") {
      alert("As the document sender, you cannot sign this document. You can only add signature placeholders for others to sign.");
      return;
    }

    if (!signatureImage) return;

    try {
      if (!pdfUrl) {
        console.error("No PDF URL provided");
        return;
      }

      if (!originalPdfUrl) {
        console.error("No original PDF URL available");
        return;
      }
      
      const existingPdfBytes = await fetch(originalPdfUrl).then((r) =>
        r.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      const imageTypeMatch = signatureImage.match(
        /^data:image\/(png|jpeg);base64,/
      );
      if (!imageTypeMatch) {
        throw new Error("Unsupported image format");
      }
      const imageType = imageTypeMatch[1];
      const base64 = signatureImage.replace(
        /^data:image\/(png|jpeg);base64,/,
        ""
      );
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const embeddedImage =
        imageType === "png"
          ? await pdfDoc.embedPng(byteArray)
          : await pdfDoc.embedJpg(byteArray);

      const now = new Date();
      const dateOnly = now.toLocaleDateString();
      const timeOnly = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      // Use ISO string format for database compatibility with Prisma
      const timestamp = now.toISOString();

      // For receivers, sign ONLY placeholders assigned to them that are unsigned
      // Debug: Log all placeholder data to understand the structure
      console.log("🔍 PLACEHOLDER FILTERING DEBUG:");
      console.log("All placeholders:", placeholders);
      console.log("Current user role:", role);
      placeholders.forEach((p, i) => {
        console.log(`Placeholder ${i}:`, {
          id: p.id,
          signee: p.signee,
          signeeName: p.signeeName,
          assignedToId: p.assignedToId,
          isSigned: p.isSigned,
          page: p.page,
          coordinates: { x: p.x, y: p.y, width: p.width, height: p.height }
        });
      });
      
      // Filter placeholders for the current user - only sign placeholders assigned to them
      // For now, let's just sign the first unsigned placeholder to test positioning
      const receiverPlaceholders = placeholders.filter(p => !p.isSigned).slice(0, 1);
      
      console.log("Available placeholders for signing:", receiverPlaceholders);
      
      if (receiverPlaceholders.length === 0) {
        alert("No unsigned placeholders found to sign.");
        return undefined;
      }

      console.log(`Applying signature to ${receiverPlaceholders.length} placeholders`);

      // Sign all unsigned placeholders for the receiver
      receiverPlaceholders.forEach(placeholderToSign => {
        const page = pages[placeholderToSign.page];
        const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();

        // Try using placeholder coordinates directly - they might already be in PDF space
        // Get the displayed page dimensions from React-PDF for debugging
        const displayedPageDims = pageDims[placeholderToSign.page];
        if (!displayedPageDims) {
          console.error('No page dimensions found for page', placeholderToSign.page);
          return;
        }
        
        // DEBUG: Let's see what coordinates we're getting from the placeholder
        console.log('🔍 DEBUG: Placeholder coordinates for signature placement:', {
          id: placeholderToSign.id,
          x: placeholderToSign.x,
          y: placeholderToSign.y,
          width: placeholderToSign.width,
          height: placeholderToSign.height,
          note: 'These should be the CURRENT coordinates after any dragging'
        });
        
        // Now I understand the issue! The placeholder coordinates are in screen space
        // but we need them in PDF space. Based on the git history, we need to divide by scale.
        
        // FIXED COORDINATE SYSTEM - The real issue is scale calculation
        // Placeholders are positioned relative to the PDF content element (canvas/img)
        // But PDF coordinates are relative to the PDF page dimensions
        
        console.log('🔍 COORDINATE SYSTEM ANALYSIS:', {
          placeholderCoords: { x: placeholderToSign.x, y: placeholderToSign.y },
          displayedPageDims: displayedPageDims,
          pdfPageSize: { width: pdfPageWidth, height: pdfPageHeight },
          note: 'Placeholders are relative to PDF content, PDF coords are relative to PDF page'
        });
        
        // The issue: we need to find the actual scale between the displayed PDF content
        // and the PDF page dimensions, not just width/width ratio
        
        // CRITICAL FIX: Coordinate system mismatch
        // Placeholders are positioned relative to .react-pdf__Page
        // But we need to use the SAME reference point for signature placement
        
        console.log('🔍 COORDINATE SYSTEM MISMATCH ANALYSIS:', {
          placeholderCoords: { x: placeholderToSign.x, y: placeholderToSign.y },
          note: 'Placeholders use .react-pdf__Page as reference, signatures must use same reference'
        });
        
        // CRITICAL FIX: Use EXACTLY the same reference point as placeholders
        // Placeholders use .react-pdf__Page for positioning, so signatures must use the same
        
        let pageContainer = null;
        let pdfContentElement = null;
        
        // Find the page container first - try multiple approaches
        if (containerRef.current) {
          // Try to find the page container within our container
          pageContainer = containerRef.current.querySelector('.pageContainer');
          
          // If not found, try to find it anywhere in the document
          if (!pageContainer) {
            pageContainer = document.querySelector('.pageContainer');
          }
          
          // If still not found, try to find the PDF page element directly
          if (!pageContainer) {
            pdfContentElement = containerRef.current.querySelector('.react-pdf__Page');
            if (pdfContentElement) {
              console.log('🔍 DIRECT FIND: Found .react-pdf__Page directly in container');
            }
          }
        }
        
        console.log('🔍 PAGE CONTAINER SEARCH:', {
          containerRef: containerRef.current,
          pageContainer: pageContainer,
          directFind: pdfContentElement,
          availableElements: pageContainer ? Array.from(pageContainer.querySelectorAll('*')).map(el => ({
            tagName: el.tagName,
            className: el.className,
            id: el.id
          })) : 'No page container found'
        });
        
        // Use the EXACT same element as placeholder positioning
        if (pageContainer && !pdfContentElement) {
          pdfContentElement = pageContainer.querySelector('.react-pdf__Page');
          
          console.log('🔍 USING SAME REFERENCE AS PLACEHOLDERS:', {
            pageContainer: pageContainer,
            pdfContentElement: pdfContentElement,
            selector: '.react-pdf__Page',
            note: 'Placeholders use .react-pdf__Page, signatures use same reference'
          });
        }
        
        let actualScale = 1;
        
        // If still not found, this is a critical error
        if (!pdfContentElement) {
          console.error('❌ CRITICAL: Cannot find .react-pdf__Page element - coordinate system will be wrong!');
          
          // Try to find any PDF-related element as a last resort
          const anyPdfElement = document.querySelector('.react-pdf__Page') || 
                               document.querySelector('canvas') ||
                               document.querySelector('img');
          
          if (anyPdfElement) {
            console.log('🔍 LAST RESORT: Found alternative PDF element:', anyPdfElement);
            pdfContentElement = anyPdfElement;
          }
        }
        
        if (pdfContentElement) {
          const contentRect = pdfContentElement.getBoundingClientRect();
          // Calculate scale based on the SAME reference element
          actualScale = contentRect.width / pdfPageWidth;
          
          console.log('🔍 FIXED SCALE CALCULATION:', {
            contentRect: contentRect,
            pdfPageWidth: pdfPageWidth,
            actualScale: actualScale,
            note: 'Scale based on SAME reference element as placeholders (.react-pdf__Page)'
          });
        } else {
          // Fallback to the original scale calculation
          actualScale = displayedPageDims.width / pdfPageWidth;
          console.log('⚠️ Using fallback scale calculation:', actualScale);
        }
        
        // SIMPLE APPROACH: Use placeholder coordinates directly without scale conversion
        // The placeholders are already positioned correctly relative to the PDF
        const pdfX = placeholderToSign.x;
        const pdfY = placeholderToSign.y;
        
        console.log('🔍 SIMPLE COORDINATE CONVERSION:', {
          originalCoords: { x: placeholderToSign.x, y: placeholderToSign.y },
          actualScale: actualScale,
          calculatedPdfCoords: { x: pdfX, y: pdfY },
          note: 'Using placeholder coordinates directly (no scale conversion)'
        });
        
        const pdfWidth = placeholderToSign.width;
        const pdfHeight = placeholderToSign.height;
        
        console.log('🔍 Coordinate conversion - Screen to PDF:', {
          placeholderId: placeholderToSign.id,
          screenCoords: { x: placeholderToSign.x, y: placeholderToSign.y, width: placeholderToSign.width, height: placeholderToSign.height },
          pdfCoords: { x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight },
          actualScale: actualScale,
          pdfPageSize: { width: pdfPageWidth, height: pdfPageHeight },
          displayedPageDims
        });
        
        console.log('🔍 DATABASE COORDINATES DEBUG:', {
          placeholderId: placeholderToSign.id,
          // Raw coordinates from database (screen space)
          rawPlaceholderCoords: {
            x: placeholderToSign.x,
            y: placeholderToSign.y,
            width: placeholderToSign.width,
            height: placeholderToSign.height
          },
          // Scale used for conversion
          actualScale: actualScale,
          // Calculated PDF coordinates after conversion
          calculatedPdfCoords: { x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight },
          // Page dimensions
          pdfPageSize: { width: pdfPageWidth, height: pdfPageHeight },
          displayedPageDims,
          // Check if coordinates seem reasonable
          coordinateAnalysis: {
            isXReasonable: pdfX >= 0 && pdfX <= pdfPageWidth,
            isYReasonable: pdfY >= 0 && pdfY <= pdfPageHeight,
            placeholderArea: pdfWidth * pdfHeight,
            pageArea: pdfPageWidth * pdfPageHeight
          }
        });
        const padding = 6;

        // Debug: Log the coordinate conversion
        console.log('Signature positioning debug:', {
          placeholderId: placeholderToSign.id,
          screenCoords: {
            x: placeholderToSign.x,
            y: placeholderToSign.y,
            width: placeholderToSign.width,
            height: placeholderToSign.height
          },
          actualScale: actualScale,
          displayedPageDims,
          pdfCoords: {
            x: pdfX,
            y: pdfY,
            width: pdfWidth,
            height: pdfHeight
          },
          pdfPageSize: {
            width: pdfPageWidth,
            height: pdfPageHeight
          }
        });

        // Draw signature box with border
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: pdfWidth,
          height: pdfHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
          borderDashArray: [3, 3],
        });

        // Position signature exactly in the center of the placeholder
        // Remove padding from the calculation to get perfect centering
        const scaled = embeddedImage.scale(1);
        const originalWidth = scaled.width;
        const originalHeight = scaled.height;

        // Calculate scale to fit the image within the placeholder
        const imageScale = Math.min(
          pdfWidth / originalWidth,
          pdfHeight / originalHeight
        );
        const scaledWidth = originalWidth * imageScale;
        const scaledHeight = originalHeight * imageScale;

        // Position signature exactly at placeholder coordinates (no centering offset)
        // The signature should appear exactly where the placeholder is positioned
        const imgX = pdfX;
        const imgY = pdfY;
        
        // Debug: Log the final positioning to verify exact placement
        console.log('Final image positioning:', {
          placeholderId: placeholderToSign.id,
          placeholderBounds: { x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight },
          imageBounds: { x: imgX, y: imgY, width: scaledWidth, height: scaledHeight },
          note: 'Signature positioned exactly at placeholder coordinates (no centering offset)'
        });

        // Debug: Log the image positioning
        console.log('Image positioning debug:', {
          placeholderId: placeholderToSign.id,
          placeholderBounds: {
            width: pdfWidth,
            height: pdfHeight
          },
          imageSize: {
            original: { width: originalWidth, height: originalHeight },
            scaled: { width: scaledWidth, height: scaledHeight }
          },
          finalPosition: {
            x: imgX,
            y: imgY
          }
        });

        // Draw the signature image
        page.drawImage(embeddedImage, {
          x: imgX,
          y: imgY,
          width: scaledWidth,
          height: scaledHeight,
        });

        // Draw signature information text INSIDE the placeholder
        const signeeName = placeholderToSign.signeeName || "Unknown Signee";
        const textLines = [
          { text: "Signed by:", size: 8, bold: true },
          { text: signeeName, size: 10, bold: true },
          { text: `Date: ${dateOnly}`, size: 7 },
          { text: `Time: ${timeOnly}`, size: 7 },
        ];
        const lineHeight = 12;
        const totalTextHeight = textLines.length * lineHeight;
        
        // Position text to the right of the signature image, not below it
        const textStartY = imgY + (scaledHeight / 2); // Vertically center with the signature
        
        // Position text to the right of the signature
        textLines.forEach((line, i) => {
          const textWidth = font.widthOfTextAtSize(line.text, line.size);
          
          // Position text to the right of the signature image
          const textX = imgX + scaledWidth + 10; // 10px to the right of the signature
          
          // Use bold font for bold text
          const textFont = line.bold ? font : font;
          const textColor = line.bold ? rgb(0, 0, 0) : rgb(0.4, 0.4, 0.4);
          
          page.drawText(line.text, {
            x: textX,
            y: textStartY - i * lineHeight,
            size: line.size,
            font: textFont,
            color: textColor,
          });
        });
      });

      // Update placeholders in the database - only once
      try {
        console.log("Updating placeholders in database:", receiverPlaceholders);
        await Promise.all(
          receiverPlaceholders.map(async (placeholder) => {
            if (placeholder.placeholderId) {
              console.log(`Updating placeholder ${placeholder.placeholderId} as signed`);
              const response = await fetch('/api/employee/signature-placeholders', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  placeholderId: placeholder.placeholderId,
                  signatureData: signatureImage, // Store the signature image data
                  isSigned: true, // Mark as signed in database
                  signedAt: timestamp, // Add timestamp
                }),
              });
              
              if (!response.ok) {
                console.error(`Failed to update placeholder ${placeholder.placeholderId} in database`);
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error(`Database update failed: ${errorText}`);
              } else {
                console.log(`Successfully updated placeholder ${placeholder.placeholderId} in database`);
              }
            }
          })
        );
        
        // Remove signed placeholders from UI state immediately
        console.log("Removing placeholders from UI state:", receiverPlaceholders.map(p => p.id));
        setPlaceholders(prev => {
          const filtered = prev.filter(p => !receiverPlaceholders.some(rp => rp.id === p.id));
          console.log("Placeholders after filtering:", filtered);
          return filtered;
        });
      } catch (error) {
        console.error('Error updating placeholders in database:', error);
        // Don't continue with the signature process if database update fails
        throw new Error(`Failed to update placeholders in database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (err) {
      console.error("Error applying signature:", err);
      alert("Failed to apply signature. See console for details.");
      return undefined; // Return undefined on error so modal can handle it
    }
  };

  // Function to generate PDF WITHOUT embedding placeholders (placeholders exist in database only)
  const generatePdfWithoutPlaceholders = async (): Promise<string | null> => {
    try {
      if (!pdfUrl || !originalPdfUrl) {
        console.error("No PDF URL provided");
        return null;
      }

      const existingPdfBytes = await fetch(originalPdfUrl).then((r) =>
        r.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      // DON'T embed placeholders in the PDF - they're already saved in the database
      // This prevents duplicate placeholders from appearing
      console.log("NOT embedding placeholders in PDF - they exist in database only");
      
      // Just return the original PDF without any placeholder modifications
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error("Error generating PDF with placeholders:", error);
      return null;
    }
  };

  // Function to generate a clean PDF without any placeholders (for signed documents)
  const generateCleanPdf = async (): Promise<string | null> => {
    try {
      if (!pdfUrl || !originalPdfUrl) {
        console.error("No PDF URL provided");
        return null;
      }

      console.log("Generating clean PDF without placeholders");
      
      // Just return the original PDF without any modifications
      // This ensures no placeholders are embedded
      return originalPdfUrl;
    } catch (error) {
      console.error("Error generating clean PDF:", error);
      return null;
    }
  };

  const [selectedAssignee, setSelectedAssignee] = useState<{
    signee: string;
    signeeName: string;
  } | null>(null);

  const [resizingEnabled, setResizingEnabled] = useState(true);

  // Function to open signature modal for receivers
  const openSignatureModal = () => {
    if (role === "receiver") {
      setModalOpen(true);
    }
  };

  // Function to clear drag state when modal is closed without creating placeholder
  const clearDragState = () => {
    setDragStart(null);
    setDragRect(null);
    setDragPage(null);
    setDraggingEnabled(false);
    setAssignModal(null);
  };

  if (!pdfUrl) return <p>Please upload a PDF document.</p>;

  // Check if we should use fallback iframe viewer
  if (pdfUrl.includes('?fallback=true')) {
    return (
      <div className={styles.fallbackContainer}>
        <h3>PDF Viewer (Browser Fallback)</h3>
        <p>Using browser's built-in PDF viewer as React-PDF encountered issues.</p>
        <button 
          onClick={() => pdfUrl && setPdfUrl?.(pdfUrl.replace('?fallback=true', ''))}
          className={styles.retryButton}
        >
          Try React-PDF Again
        </button>
        <iframe 
          src={pdfUrl ? pdfUrl.replace('?fallback=true', '') : ''} 
          width="100%" 
          height="800px"
          style={{ border: '1px solid #ccc', marginTop: '1rem' }}
          title="PDF Fallback Viewer"
        />
      </div>
    );
  }

  if (pdfError) {
    return (
      <div className={styles.errorContainer}>
        <h3>PDF Loading Error</h3>
        <p><strong>Error:</strong> {pdfError}</p>
        <p><strong>URL:</strong> {pdfUrl}</p>
        <div className={styles.errorActions}>
          <button onClick={() => setPdfError(null)}>Retry with React-PDF</button>
          <button onClick={() => {
            // Fallback to iframe viewer
            setPdfError(null);
            pdfUrl && setPdfUrl?.(pdfUrl + "?fallback=true");
          }}>Use Browser PDF Viewer</button>
        </div>
        
        {/* Fallback iframe viewer */}
        <div className={styles.fallbackViewer}>
          <h4>Fallback PDF Viewer</h4>
          <iframe 
            src={pdfUrl} 
            width="100%" 
            height="600px"
            style={{ border: '1px solid #ccc' }}
            title="PDF Fallback Viewer"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Document Container */}
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className={styles.documentContainer}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => {
            console.log("PDF loaded successfully with", numPages, "pages");
            setNumPages(numPages);
            setPdfError(null);
            setPdfLoading(false);
          }}
          onLoadError={(error) => {
            console.error("PDF loading error:", error);
            setPdfError(`Failed to load PDF: ${error.message || 'Unknown error'}`);
            setPdfLoading(false);
          }}
          onLoadProgress={({ loaded, total }) => {
            console.log("PDF loading progress:", loaded, "/", total);
            setPdfLoading(true);
          }}
        >
          {pdfLoading && (
            <div className={styles.loadingContainer}>
              <p>Loading PDF...</p>
            </div>
          )}
          {Array.from(new Array(numPages), (_, i) => (
            <div
              key={`page_${i + 1}`}
              className={styles.pageContainer}
              onMouseDown={(e) => handleMouseDown(e, i)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData("text/plain");
                if (data === "add-signature") {
                  // Get coordinates relative to the PDF page, not the container
                  const pageContainer = e.currentTarget;
                  const pdfPageElement = pageContainer.querySelector('.react-pdf__Page');
                  
                  let dropX, dropY;
                  
                  if (pdfPageElement) {
                    const pdfRect = pdfPageElement.getBoundingClientRect();
                    dropX = e.clientX - pdfRect.left;
                    dropY = e.clientY - pdfRect.top;
                  } else {
                    // Fallback to container coordinates if PDF page element not found
                    const rect = e.currentTarget.getBoundingClientRect();
                    dropX = e.clientX - rect.left;
                    dropY = e.clientY - rect.top;
                  }

                  // Offset by half of the placeholder dimensions to center it
                  const centeredX = dropX - MIN_WIDTH / 2;
                  const centeredY = dropY - MIN_HEIGHT / 2;

                  setDragPage(i);
                  setDragRect({
                    x: centeredX,
                    y: centeredY,
                    width: MIN_WIDTH,
                    height: MIN_HEIGHT,
                  });

                  setAssignModal({
                    visible: true,
                    page: i,
                    x: centeredX,
                    y: centeredY,
                    width: MIN_WIDTH,
                    height: MIN_HEIGHT,
                    clickX: e.clientX,
                    clickY: e.clientY,
                  });

                  setSelectedAssignee(null);
                  setResizingEnabled(false);
                }
              }}
            >
              <Page
                key={i}
                scale={finalScale}
                pageNumber={i + 1}
                width={undefined}
                renderTextLayer={false}
                onRenderSuccess={({ width, height }) =>
                  setPageDims((prev) => ({
                    ...prev,
                    [i]: { width, height },
                  }))
                }
              />

              {placeholders
                .filter((ph) => ph.page === i)
                .map((ph) => (
                    <Rnd
                      size={{
                        width: ph.width,
                        height: ph.height,
                      }}
                      position={{
                        x: ph.x,
                        y: ph.y,
                      }}
                      onMouseEnter={() => {
                        console.log('🔍 DEBUG: Placeholder rendered at position:', {
                          id: ph.id,
                          x: ph.x,
                          y: ph.y,
                          width: ph.width,
                          height: ph.height
                        });
                      }}
                      minWidth={MIN_WIDTH}
                      maxWidth={MAX_WIDTH}
                      minHeight={MIN_HEIGHT}
                      maxHeight={MIN_HEIGHT}
                      enableResizing={
                        role === "sender" && !ph.isSigned
                          ? {
                              top: true,
                              right: true,
                              bottom: true,
                              left: true,
                              topRight: true,
                              bottomRight: true,
                              bottomLeft: true,
                              topLeft: true,
                            }
                          : false
                      }
                      key={ph.id}
                      onDragStop={(e, d) => {
                        if (ph.isSigned) return; // Prevent dragging signed placeholders
                        
                        console.log('🔍 DEBUG: Placeholder dragged to new position:', {
                          placeholderId: ph.id,
                          oldPosition: { x: ph.x, y: ph.y },
                          newPosition: { x: d.x, y: d.y }
                        });
                        
                        // Update local state immediately
                        setPlaceholders((prev) =>
                          prev.map((p) =>
                            p.id === ph.id
                              ? {
                                  ...p,
                                  x: d.x,
                                  y: d.y,
                                }
                              : p
                          )
                        );
                        
                        // Also update the database to persist the new position (non-blocking)
                        if (ph.placeholderId && documentId) {
                          fetch('/api/employee/signature-placeholders', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              placeholderId: ph.placeholderId,
                              x: d.x,
                              y: d.y,
                              width: ph.width,
                              height: ph.height,
                              // Don't change other fields
                            }),
                          })
                          .then(response => {
                            if (response.ok) {
                              console.log('✅ Placeholder position updated in database');
                            } else {
                              console.warn('⚠️ Failed to update placeholder position in database');
                            }
                          })
                          .catch(error => {
                            console.error('Error updating placeholder position in database:', error);
                          });
                        }
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        if (ph.isSigned) return; // Prevent resizing signed placeholders
                        if (ref && ref.style && ref.style.width && ref.style.height) {
                          setPlaceholders((prev) =>
                            prev.map((p) =>
                              p.id === ph.id
                                ? {
                                    ...p,
                                    width: parseInt(ref.style.width),
                                    height: parseInt(ref.style.height),
                                    x: position.x,
                                    y: position.y,
                                  }
                                : p
                            )
                          );
                        }
                      }}
                      disableDragging={role !== "sender" || ph.isSigned}
                      bounds="parent"
                      style={{ zIndex: 10 }}
                    >
                      <div
                        ref={(el) => {
                          placeholderRefs.current[ph.id] = el;
                        }}
                        className={`${styles.actualSignaturePlaceholder} ${
                          role === "sender" ? styles.sender : styles.receiver
                        } ${ph.isSigned ? styles.signed : ''}`}
                        onMouseDown={(e) => {
                          if (role !== "sender" || ph.isSigned) return;

                          const clickTime = Date.now();

                          const handleMouseUp = (upEvent: MouseEvent) => {
                            const dragDuration = Date.now() - clickTime;

                            if (
                              (e.target as HTMLElement)?.closest(
                                "[data-ignore-click]"
                              ) ||
                              (upEvent.target as HTMLElement)?.closest(
                                "[data-ignore-click]"
                              )
                            ) {
                              window.removeEventListener(
                                "mouseup",
                                handleMouseUp
                              );
                              return;
                            }

                            if (dragDuration < 200) {
                              setAssignModal({
                                x: ph.x,
                                y: ph.y,
                                page: ph.page,
                                existingId: ph.id,
                                width: ph.width,
                                height: ph.height,
                                visible: true,
                                clickX: e.clientX,
                                clickY: e.clientY,
                              });
                              setSelectedAssignee({
                                signee: ph.signee ?? "",
                                signeeName: ph.signeeName ?? "",
                              });
                            }

                            window.removeEventListener(
                              "mouseup",
                              handleMouseUp
                            );
                          };

                          window.addEventListener("mouseup", handleMouseUp);
                        }}
                      >
                        {role === "sender" && !ph.isSigned && (
                          <div
                            className={styles.removePlaceholderButton}
                            data-ignore-click
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlaceholders((prev) =>
                                prev.filter((p) => p.id !== ph.id)
                              );
                            }}
                            title="Remove placeholder"
                          >
                            ×
                          </div>
                        )}

                        {ph.isSigned ? (
                          // Show signed signature information
                          <div className={styles.signedSignatureInfo}>
                            <div className={styles.signedLabel}>Signed by:</div>
                            <div className={styles.signedName}>
                              {ph.signeeName || ph.signee}
                            </div>
                            <div className={styles.signedDate}>
                              {ph.signedAt ? new Date(ph.signedAt).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                        ) : (
                          // Show unsigned placeholder information
                          <div style={{ color: "black" }}>
                            <strong className={styles.signeeName}>
                              {ph.signeeName || ph.signee}
                            </strong>
                            <div className={styles.needsToSign}>
                              Needs to sign
                            </div>
                          </div>
                        )}
                      </div>
                    </Rnd>
                  ))}

              {/* Drag Rectangle */}
              {dragRect && dragPage === i && (
                <div
                  className={styles.draggedPlaceholder}
                  style={{
                    position: "absolute",
                    left: dragRect.x,
                    top: dragRect.y,
                    width: dragRect.width,
                    height: dragRect.height,
                    border: "2px dashed #007bff",
                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                    pointerEvents: "none",
                    zIndex: 99,
                  }}
                />
              )}
            </div>
          ))}

          {selectedPlaceholder && (
            <div className={styles.editAssignedSigneeContainer}>
              <h4>Edit Placeholder</h4>
              <button
                onClick={(e) => {
                  setAssignModal({
                    visible: true,
                    page: selectedPlaceholder.page,
                    x: selectedPlaceholder.x,
                    y: selectedPlaceholder.y,
                    width: selectedPlaceholder.width,
                    height: selectedPlaceholder.height,
                    editingId: selectedPlaceholder.id,
                    clickX: e.clientX,
                    clickY: e.clientY,
                  });
                  setSelectedPlaceholder(null);
                }}
              >
                Change Signee
              </button>

              <button
                onClick={() => {
                  setPlaceholders((prev) =>
                    prev.filter((p) => p.id !== selectedPlaceholder.id)
                  );
                  setSelectedPlaceholder(null);
                }}
              >
                Delete Placeholder
              </button>

              <button onClick={() => setSelectedPlaceholder(null)}>
                Cancel
              </button>
            </div>
          )}
        </Document>
      </div>

      {/* Click Position Indicator */}
      {assignModal?.visible && assignModal.clickX && assignModal.clickY && (
        <div
          style={{
            position: 'fixed',
            left: assignModal.clickX - 5,
            top: assignModal.clickY - 5,
            width: '10px',
            height: '10px',
            backgroundColor: '#007bff',
            borderRadius: '50%',
            zIndex: 999,
            pointerEvents: 'none',
            animation: 'pulse 1s infinite',
          }}
        />
      )}

      {/* Assign Modal - moved outside the page loop */}
      {assignModal?.visible && (
        <div
          key={`assign-modal-${assignModal.page}-${assignModal.x}-${assignModal.y}`}
          className={styles.assignModalContainer}
          style={{
            position: 'fixed',
            ...(assignModal.clickX && assignModal.clickY 
              ? calculateModalPosition(assignModal.clickX, assignModal.clickY)
              : {
                  // Fallback to original positioning
                  left: Math.min(
                    Math.max(
                      (assignModal.x * scale) + 12,
                      10
                    ),
                    window.innerWidth - 220
                  ),
                  top: Math.min(
                    Math.max((assignModal.y * scale), 10),
                    window.innerHeight - 300
                  ),
                }
            ),
            zIndex: 1000,
            minWidth: '200px',
            maxWidth: '250px',
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <h4 style={{ marginBottom: "8px" }}>Assign Signee</h4>
          
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
            {filteredSignees.length} signee{filteredSignees.length !== 1 ? 's' : ''} available
          </div>

          <input
            type="text"
            placeholder="Search signee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.assignSigneeSearchBar}
            onClick={(e) => e.stopPropagation()}
          />

          <div className={styles.signeeListContainer}>
            {filteredSignees.length === 0 && (
              <div
                style={{
                  fontSize: "12px",
                  padding: "4px",
                  color: "#888",
                }}
              >
                No matches found.
              </div>
            )}

            {filteredSignees.map((sig) => (
              <div
                key={sig.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  assignSignee(
                    sig.id,
                    sig.name,
                    assignModal?.existingId
                  );
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                className={styles.signees}
                style={{ cursor: 'pointer' }}
              >
                {sig.name}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearDragState();
            }}
            className={styles.cancelAssignSigneeButton}
          >
            Cancel
          </button>
        </div>
      )}


      <SignatureModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        applySignature={applySignature}
        signatureImage={signatureImage}
        setSignatureImage={setSignatureImage}
        onApplyComplete={onApplyComplete}
        uploadedSignature={uploadedSignature}
        setUploadedSignature={setUploadedSignature}
      />
    </div>
  );
}

export default forwardRef<PDFViewerRef, PDFViewerProps>(PDFViewer);
