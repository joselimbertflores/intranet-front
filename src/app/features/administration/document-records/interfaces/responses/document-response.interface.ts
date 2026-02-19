export interface DocumentManageResponse {
  id: string;
  title: string;
  fiscalYear: number;
  section: Section;
  type: Type;
  subtype: Subtype;
  file: File;
  fileId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  id: number;
  storedName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  storageKey: string;
  status: string;
  parentFileId: null;
  createdBy: null;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  name: string;
}

export interface Subtype {
  id: number;
  name: string;
}

export interface Type {
  id: number;
  name: string;
}
