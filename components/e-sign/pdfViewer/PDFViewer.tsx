"use client";

import React, { useState, useRef, useImperativeHandle, useEffect, forwardRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import styles from "./PDFViewer.module.css";
import type { PDFViewerProps, PDFViewerRef, Placeholder } from "../types";
import SignatureModal from "../signatureModal/SignatureModal";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  }: PDFViewerProps,
  ref: React.Ref<PDFViewerRef>
) {
  const [numPages, setNumPages] = useState<number>(0);

  const [uploadedSignature, setUploadedSignature] = useState<string | null>(
    null
  );

  useImperativeHandle(ref, () => ({
    applySignature,
    resetSignaturePreview,
    generatePdfWithPlaceholders,
  }));

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
  const [scale, setScale] = useState(1); // ← this is the original PDF width you expect

  useEffect(() => {
    if (!containerRef.current) return;

    let timeout: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver(([entry]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const containerWidth = entry.contentRect.width;
        const newScale = Math.min(containerWidth / BASE_WIDTH, 1);
        setScale(newScale);
        
        // Also update container dimensions
        const { width, height } = entry.contentRect;
        setContainerDims({ width, height });
      }, 100); // debounce time
    });

    resizeObserver.observe(containerRef.current);
    
    // Set initial dimensions
    const rect = containerRef.current.getBoundingClientRect();
    setContainerDims({ width: rect.width, height: rect.height });
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const [pageDims, setPageDims] = useState<
    Record<number, { width: number; height: number }>
  >({});

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

  const [containerDims, setContainerDims] = useState<{
    width: number;
    height: number;
  }>({ width: 800, height: 1000 });

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
  } | null>(null);

  const [search, setSearch] = useState("");

  const filteredSignees = signees.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );



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
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setDragPage(page);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart || dragPage === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = Math.abs(x - dragStart.x);
    const height = Math.abs(y - dragStart.y);
    const originX = Math.min(x, dragStart.x);
    const originY = Math.min(y, dragStart.y);

    setDragRect({ x: originX, y: originY, width, height });
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

      const newPlaceholder: Placeholder = {
        id: Date.now(),
        page: dragPage,
        x: dragRect.x,
        y: dragRect.y,
        width: MIN_WIDTH,
        height: MIN_HEIGHT,
        signee,
        signeeName,
        isSigned: false,
        signedAt: null,
        initials: null,
        assignedToId: userId, // Set the database user ID
      };

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
      const timestamp = now.toLocaleString();

      // For receivers, sign ALL their unsigned placeholders
      const receiverPlaceholders = placeholders.filter(p => !p.isSigned);
      if (receiverPlaceholders.length === 0) {
        alert("No placeholders found to sign.");
        return;
      }

      console.log(`Applying signature to ${receiverPlaceholders.length} placeholders`);

      // Sign all unsigned placeholders for the receiver
      receiverPlaceholders.forEach(placeholderToSign => {
        const page = pages[placeholderToSign.page];
        const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();

        // Convert from scaled screen space → actual PDF space
        const pdfX = placeholderToSign.x / scale;
        const pdfY = pdfPageHeight - (placeholderToSign.y + placeholderToSign.height) / scale;
        const pdfWidth = placeholderToSign.width / scale;
        const pdfHeight = placeholderToSign.height / scale;
        const padding = 6;

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

        const halfWidth = pdfWidth / 2;
        const imgBoxWidth = halfWidth - padding * 2;
        const imgBoxHeight = pdfHeight - padding * 2;

        const scaled = embeddedImage.scale(1);
        const originalWidth = scaled.width;
        const originalHeight = scaled.height;

        const imageScale = Math.min(
          imgBoxWidth / originalWidth,
          imgBoxHeight / originalHeight
        );
        const scaledWidth = originalWidth * imageScale;
        const scaledHeight = originalHeight * imageScale;

        const imgX = pdfX + padding + (imgBoxWidth - scaledWidth) / 2;
        const imgY = pdfY + padding + (imgBoxHeight - scaledHeight) / 2;

        // Draw the signature image
        page.drawImage(embeddedImage, {
          x: imgX,
          y: imgY,
          width: scaledWidth,
          height: scaledHeight,
        });

        // Draw signature information text
        const textBlockX = pdfX + halfWidth + padding;
        const signeeName = placeholderToSign.signeeName || "Unknown Signee";
        const textLines = [
          { text: "Signed by:", size: 8, bold: true },
          { text: signeeName, size: 10, bold: true },
          { text: `Date: ${dateOnly}`, size: 7 },
          { text: `Time: ${timeOnly}`, size: 7 },
        ];
        const lineHeight = 12;
        const totalTextHeight = textLines.length * lineHeight;
        const textStartY =
          pdfY + (pdfHeight + totalTextHeight) / 2 - lineHeight;

        textLines.forEach((line, i) => {
          const textWidth = font.widthOfTextAtSize(line.text, line.size);
          const textX =
            textBlockX + (halfWidth - padding * 2 - textWidth) / 2;
          
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

      // Update ALL placeholders as signed
      setPlaceholders(prev => prev.map(p => 
        !p.isSigned 
          ? { ...p, isSigned: true, signedAt: timestamp }
          : p
      ));

      // Update placeholders in the database
      try {
        await Promise.all(
          receiverPlaceholders.map(async (placeholder) => {
            if (placeholder.placeholderId) {
              const response = await fetch('/api/employee/signature-placeholders', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  placeholderId: placeholder.placeholderId,
                  signatureData: signatureImage, // Store the signature image data
                }),
              });
              
              if (!response.ok) {
                console.error(`Failed to update placeholder ${placeholder.placeholderId} in database`);
              }
            }
          })
        );
      } catch (error) {
        console.error('Error updating placeholders in database:', error);
        // Continue with the signature process even if database update fails
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
    }
  };

  // Function to generate PDF with placeholders visible (for sender to save)
  const generatePdfWithPlaceholders = async (): Promise<string | null> => {
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

      // Add all placeholders to the PDF
      placeholders.forEach((ph) => {
        const page = pages[ph.page];
        if (!page) return; // Skip if page doesn't exist

        // Convert from scaled screen space to actual PDF space
        const pdfX = ph.x / scale;
        // Adjust Y coordinate to account for PDF coordinate system offset
        const pdfY = page.getSize().height - (ph.y + ph.height) / scale + 8;
        const pdfWidth = ph.width / scale;
        const pdfHeight = ph.height / scale;

        // Draw placeholder rectangle with better visibility
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: pdfWidth,
          height: pdfHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 2,
          borderDashArray: [5, 5],
          color: rgb(0.95, 0.95, 1), // Light blue background
        });

        // Add placeholder text with better positioning
        const signeeName = ph.signeeName || 'Unknown Signee';
        const placeholderText = `Signature for: ${signeeName}`;
        const textSize = Math.min(10, pdfHeight / 3); // Adaptive text size
        const textWidth = font.widthOfTextAtSize(placeholderText, textSize);
        
        // Center text horizontally and vertically
        const textX = pdfX + (pdfWidth - textWidth) / 2;
        const textY = pdfY + pdfHeight / 2 + textSize / 3;

        page.drawText(placeholderText, {
          x: textX,
          y: textY,
          size: textSize,
          font,
          color: rgb(0, 0, 0),
        });

        // Add "Click to sign" instruction below
        const instructionText = "Click to sign";
        const instructionSize = Math.min(8, textSize * 0.8);
        const instructionWidth = font.widthOfTextAtSize(instructionText, instructionSize);
        const instructionX = pdfX + (pdfWidth - instructionWidth) / 2;
        const instructionY = pdfY + pdfHeight / 2 - instructionSize;

        page.drawText(instructionText, {
          x: instructionX,
          y: instructionY,
          size: instructionSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (err) {
      console.error("Error generating PDF with placeholders:", err);
      alert("Failed to generate PDF with placeholders. See console for details.");
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
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={console.error}
        >
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
                  const rect = e.currentTarget.getBoundingClientRect();
                  const dropX = e.clientX - rect.left;
                  const dropY = e.clientY - rect.top;

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
                  });

                  setSelectedAssignee(null);
                  setResizingEnabled(false);
                }
              }}
            >
              <Page
                key={i}
                scale={scale}
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
                        width: ph.width * scale,
                        height: ph.height * scale,
                      }}
                      position={{
                        x: ph.x * scale,
                        y: ph.y * scale,
                      }}
                      minWidth={MIN_WIDTH * scale}
                      maxWidth={MAX_WIDTH * scale}
                      minHeight={MIN_HEIGHT * scale}
                      maxHeight={MIN_HEIGHT * scale}
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
                        setPlaceholders((prev) =>
                          prev.map((p) =>
                            p.id === ph.id
                              ? {
                                  ...p,
                                  x: d.x / scale,
                                  y: d.y / scale,
                                }
                              : p
                          )
                        );
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        if (ph.isSigned) return; // Prevent resizing signed placeholders
                        setPlaceholders((prev) =>
                          prev.map((p) =>
                            p.id === ph.id
                              ? {
                                  ...p,
                                  width: parseInt(ref.style.width) / scale,
                                  height: parseInt(ref.style.height) / scale,
                                  x: position.x / scale,
                                  y: position.y / scale,
                                }
                              : p
                          )
                        );
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
                    left: dragRect.x * scale,
                    top: dragRect.y * scale,
                    width: dragRect.width * scale,
                    height: dragRect.height * scale,
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
                onClick={() => {
                  setAssignModal({
                    visible: true,
                    page: selectedPlaceholder.page,
                    x: selectedPlaceholder.x,
                    y: selectedPlaceholder.y,
                    width: selectedPlaceholder.width,
                    height: selectedPlaceholder.height,
                    editingId: selectedPlaceholder.id,
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

      {/* Assign Modal - moved outside the page loop */}
      {assignModal?.visible && (
        <div
          key={`assign-modal-${assignModal.page}-${assignModal.x}-${assignModal.y}`}
          className={styles.assignModalContainer}
          style={{
            position: 'fixed',
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
