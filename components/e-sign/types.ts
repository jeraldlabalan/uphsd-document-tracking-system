import type { Dispatch, SetStateAction } from "react";

export type Props = {
  role: string;
  pdfUrl: string | null;
};

export type PDFViewerProps = {
  role: Role;
  pdfUrl: string;
  placeholders: Placeholder[];
  setPlaceholders: React.Dispatch<React.SetStateAction<Placeholder[]>>;
  placeholderRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  draggingEnabled: boolean;
  setDraggingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onApplyComplete: (signedUrl: string) => void;
  viewMode: "edit" | "signed";
  setViewMode: React.Dispatch<React.SetStateAction<"edit" | "signed">>;
  originalPdfUrl: string | null;
  hasSigned: boolean;
  signees: Signee[];
  documentId?: string;
  onSavePlaceholders?: (placeholders: Placeholder[]) => void;
};

export type Placeholder = {
  id: number;
  placeholderId?: number; // Database ID when saved
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  signee: string; // User ID
  signeeName: string;
  isSigned: boolean;
  signedAt?: string | null;
  initials?: string | null;
  assignedToId?: number; // Database User ID
};

export type SignatureModalProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  applySignature: (image: string) => Promise<string | undefined>; 
  signatureImage: string | null;
  setSignatureImage: React.Dispatch<React.SetStateAction<string | null>>;
  onApplyComplete: (url: string) => void;
  uploadedSignature: string | null;
  setUploadedSignature: React.Dispatch<React.SetStateAction<string | null>>;
};

export type Signee = {
  id: string;
  name: string;
  userId?: number; // Database User ID
};

export type Role = "sender" | "receiver" | string;

export type SidebarProps = {
  role: Role;
  signees: Signee[];
  onRoleChange: Dispatch<SetStateAction<Role>>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholders: Placeholder[];
  jumpToNextSignature: () => void;
  onOpenSignatureModal?: () => void;
  setModalOpen: (open: boolean) => void; 
  setDraggingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  hasSigned: boolean;
  resetSignaturePreview: () => void;
  setViewMode: React.Dispatch<React.SetStateAction<"edit" | "signed">>;
  onSaveFile?: () => void;
  onSavePlaceholders?: (placeholders: Placeholder[]) => void;
  onBackToDashboard?: () => void;
  documentId?: string;
  isDocumentCreator?: boolean;
}

export interface PDFViewerRef {
  applySignature: (signatureImage: string) => Promise<string | undefined>;
  generatePdfWithoutPlaceholders: () => Promise<string | null>; // Generates PDF WITHOUT embedding placeholders
  generateCleanPdf: () => Promise<string | null>; // Generates clean PDF without placeholders
  addPlaceholder: (placeholder: Placeholder) => void;
  removePlaceholder: (id: number) => void;
  updatePlaceholder: (id: number, updates: Partial<Placeholder>) => void;
  getPlaceholders: () => Placeholder[];
  setPlaceholders: React.Dispatch<React.SetStateAction<Placeholder[]>>;
  resetSignaturePreview: () => void;
}