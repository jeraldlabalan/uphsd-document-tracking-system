"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import { Rnd } from "react-rnd";
import { StandardFonts } from "pdf-lib";
import { PDFViewerProps, Placeholder, PDFViewerRef } from "../../e-sign/types";
import styles from "./PDFViewer.module.css";
import SignatureModal from "../signatureModal/SignatureModal";
import React, { forwardRef, useImperativeHandle } from "react";

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
  }));

  const resetSignaturePreview = () => {
    setSignatureImage(null);
    setUploadedSignature(null);
    setPlaceholders((prev) =>
      prev.map(
        (p) => (p.signee === role ? { ...p, isSigned: false } : p) // make sure this signee's placeholder is always ready to re-sign
      )
    );
  };

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
      }, 100); // debounce time
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageWidth, setPageWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setPageWidth(entry.contentRect.width);
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
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

  const [dragRect, setDragRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );

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

  const signees = [
    { id: "emp001", name: "Alice Mendoza" },
    { id: "emp002", name: "Bob Santos" },
    { id: "emp003", name: "Charlie Reyes" },
    // etc.
  ];

  const filteredSignees = signees.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

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
    }

    setDragStart(null);
    setDraggingEnabled(false);
  };

  const assignSignee = (
    signee: string,
    signeeName: string,
    editingId?: number
  ) => {
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
              }
            : ph
        )
      );
    } else {
      if (!dragRect || dragPage === null) return;

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
      };

      setPlaceholders((prev) => [...prev, newPlaceholder]);
      setDragRect(null);
      setDragPage(null);
    }

    setSelectedAssignee({ signee, signeeName });

    setAssignModal(null);
  };

  const applySignature = async () => {
    if (!signatureImage) return;

    try {
      if (!pdfUrl) {
        console.error("No PDF URL provided");
        return;
      }

      const existingPdfBytes = await fetch(originalPdfUrl!).then((r) =>
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

      const signeeName =
        signees.find((s) => s.id === role)?.name || role.toUpperCase();
      const initials = signeeName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase();

      const updatedPlaceholders: Placeholder[] = placeholders.map((ph) => {
        if (ph.signee === role && !ph.isSigned) {
          const page = pages[ph.page];
          const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();

          // 🔥 Fix coordinates: convert from scaled screen space → actual PDF space
          const pdfX = ph.x / scale;
          const pdfY = pdfPageHeight - (ph.y + ph.height) / scale;
          const pdfWidth = ph.width / scale;
          const pdfHeight = ph.height / scale;
          const padding = 6;

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

          // 🔥 Rename to avoid shadowing `scale` from outer scope
          const imageScale = Math.min(
            imgBoxWidth / originalWidth,
            imgBoxHeight / originalHeight
          );
          const scaledWidth = originalWidth * imageScale;
          const scaledHeight = originalHeight * imageScale;

          const imgX = pdfX + padding + (imgBoxWidth - scaledWidth) / 2;
          const imgY = pdfY + padding + (imgBoxHeight - scaledHeight) / 2;

          page.drawImage(embeddedImage, {
            x: imgX,
            y: imgY,
            width: scaledWidth,
            height: scaledHeight,
          });

          const textBlockX = pdfX + halfWidth + padding;
          const textLines = [
            { text: "Digitally signed by", size: 8 },
            { text: signeeName, size: 10 },
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
            page.drawText(line.text, {
              x: textX,
              y: textStartY - i * lineHeight,
              size: line.size,
              font,
              color: rgb(0, 0, 0),
            });
          });

          return {
            ...ph,
            isSigned: true,
            signedAt: timestamp,
            initials,
          };
        }
        return ph;
      });

      setPlaceholders(updatedPlaceholders);

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

  const [selectedAssignee, setSelectedAssignee] = useState<{
    signee: string;
    signeeName: string;
  } | null>(null);

  const [resizingEnabled, setResizingEnabled] = useState(true);

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

              {(!hasSigned && viewMode === "edit") &&
                placeholders
                  .filter((ph) => {
                    if (ph.page !== i) return false;
                    if (
                      role === "signee" &&
                      selectedAssignee?.signee !== ph.signee
                    )
                      return false;
                    return true;
                  })
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
                      maxHeight={MAX_HEIGHT * scale}
                      enableResizing={
                        role === "sender"
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
                      disableDragging={role !== "sender"}
                      bounds="parent"
                      style={{ zIndex: 10 }}
                    >
                      <div
                        ref={(el) => {
                          placeholderRefs.current[ph.id] = el;
                        }}
                        className={`${styles.actualSignaturePlaceholder} ${
                          role === "sender" ? styles.sender : styles.receiver
                        }`}
                        onMouseDown={(e) => {
                          if (role !== "sender") return;

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
                        {role === "sender" && (
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

                        <div style={{ color: "black" }}>
                          <strong className={styles.signeeName}>
                            {ph.signeeName || ph.signee}
                          </strong>
                        </div>

                        {ph.isSigned ? (
                          <div className="text-center">
                            <div className="text-[8px] text-gray-600">
                              {ph.signedAt}
                            </div>
                          </div>
                        ) : (
                          <div className={styles.needsToSign}>
                            Needs to sign
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

              {/* Assign Modal (now inside the loop!) */}
              {assignModal?.visible && assignModal.page === i && (
                <div
                  className={styles.assignModalContainer}
                  style={{
                    left:
                      assignModal.x + MIN_WIDTH + 180 > containerDims.width
                        ? Math.max(assignModal.x - 240, 10)
                        : assignModal.x + MIN_WIDTH + 12, // 👈 narrower gap
                    top: Math.min(assignModal.y, containerDims.height - 180),
                  }}
                >
                  <h4 style={{ marginBottom: "8px" }}>Assign Signee</h4>

                  <input
                    type="text"
                    placeholder="Search signee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.assignSigneeSearchBar}
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
                        onClick={() => {
                          assignSignee(
                            sig.id,
                            sig.name,
                            assignModal?.existingId
                          );
                        }}
                        className={styles.signees}
                      >
                        {sig.name}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAssignModal(null)}
                    className={styles.cancelAssignSigneeButton}
                  >
                    Cancel
                  </button>
                </div>
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

      <SignatureModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        applySignature={applySignature}
        signatureImage={signatureImage}
        setSignatureImage={setSignatureImage}
        onApplyComplete={onApplyComplete}
        uploadedSignature={uploadedSignature} // new
        setUploadedSignature={setUploadedSignature}
      />
    </div>
  );
}

export default forwardRef<PDFViewerRef, PDFViewerProps>(PDFViewer);
