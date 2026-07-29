import { DocumentValidityStatus } from '../document-validity-status.enum';

export interface DocumentResponse {
  id: string;
  title: string;
  year: number | null;
  validityStatus: DocumentValidityStatus;
  organizationalUnit: {
    id: number;
    name: string;
  } | null;
  documentType: {
    id: number;
    name: string;
  };
  documentSubtype: {
    id: number;
    name: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  file: StoredFile;
  downloadCount: number;
}

interface StoredFile {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  url: string;
}
