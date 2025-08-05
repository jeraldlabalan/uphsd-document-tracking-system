"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Role, Signee, Placeholder } from "@/components/e-sign/types";
import styles from "./OnlineDocument.module.css";
import Sidebar from "@/components/e-sign/sidebar/Sidebar";
import { PDFViewerRef } from "@/components/e-sign/types";
import Image from "next/image";
import logo from "../../public/logo.png";

const PDFViewer = dynamic(
  () => import("@/components/e-sign/pdfViewer/PDFViewer"),
  { ssr: false }
);

export default function ESignTest() {
  const viewerRef = useRef<PDFViewerRef>(null);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState<Role>("sender");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const placeholderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [nextScrollIndex, setNextScrollIndex] = useState(0);

  const [hasSigned, setHasSigned] = useState(false);

  const SIGNEES: Signee[] = [
    { id: "emp001", name: "Alice Mendoza" },
    { id: "emp002", name: "Bob Santos" },
    { id: "emp003", name: "Charlie Reyes" },
  ];

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

  const [viewMode, setViewMode] = useState<"edit" | "signed">("edit");

  const [draggingEnabled, setDraggingEnabled] = useState(false);

  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file && file.type === "application/pdf") {
  //     const url = URL.createObjectURL(file);
  //     setPdfUrl(url);
  //   } else {
  //     alert("Please upload a valid PDF file.");
  //   }
  // };

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
              const url = URL.createObjectURL(file);
              setOriginalPdfUrl(url); // <– keep a copy of the clean PDF
              setPdfUrl(url); // <– viewer uses this too
            }
          }}
          placeholders={placeholders}
          jumpToNextSignature={jumpToNextSignature}
          setModalOpen={setModalOpen}
          setDraggingEnabled={setDraggingEnabled}
          setViewMode={setViewMode}
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
              viewMode={viewMode}
              setViewMode={setViewMode}
              onApplyComplete={(signedUrl) => {
                setPdfUrl(signedUrl); // show new one
                setHasSigned(true);
                setViewMode("signed");
              }}
              originalPdfUrl={originalPdfUrl}
              hasSigned={hasSigned}
            />
          )}
        </div>
      </div>
    </div>
  );
}
