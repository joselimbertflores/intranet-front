export interface DocumentManageResponse {
  id: string;
  displayName: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  fiscalYear: number;
  downloadCount: number;
  status: string;
  section: DocumentSection;
  type: DocumentType;
  subtype: DocumentSubtype | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentSection {
  id: number;
  name: string;
  isActive: boolean;
}

interface DocumentType {
  id: number;
  name: string;
  isActive: boolean;
}

interface DocumentSubtype {
  id: number;
  name: string;
  isActive: boolean;
}
