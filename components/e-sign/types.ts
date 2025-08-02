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

export type SignatureModalProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  applySignature: () => Promise<void>;
  signatureImage: string | null;
  setSignatureImage: React.Dispatch<React.SetStateAction<string | null>>;
};