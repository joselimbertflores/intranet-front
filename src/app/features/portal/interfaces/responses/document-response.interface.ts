export interface DocumentResponse {
  id: string;
  displayName: string;
  originalName: string;
  fiscalYear: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  section: {
    id: number;
    name: string;
  };
  type: {
    id: number;
    name: string;
  };
  fileName: string;
}

