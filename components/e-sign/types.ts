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
};


export type Placeholder = {
  id: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  signee: string;
  signeeName: string;
  isSigned: boolean;
  signedAt?: string | null;
  initials?: string | null;
};

// Update SignatureModalProps:
export type SignatureModalProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  applySignature: (image: string) => void; // ← Fix here
  signatureImage: string | null;
  setSignatureImage: React.Dispatch<React.SetStateAction<string | null>>;
};


export type Signee = {
  id: string;
  name: string;
};

export type Role = "sender" | "emp001" | "emp002" | "emp003";

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
}

export type PDFViewerRef = {
  applySignature: () => void;
};