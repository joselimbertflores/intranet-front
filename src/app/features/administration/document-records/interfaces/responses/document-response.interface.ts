export interface DocumentManageResponse {
  id: string;
  title: string;
  year: number;
  organizationalUnit: {
    id: string;
    name: string;
  };
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
