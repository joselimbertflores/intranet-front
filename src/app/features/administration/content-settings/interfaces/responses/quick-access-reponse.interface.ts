export interface QuickAccessResponse {
  id: number;
  title: string;
  description: string | null;
  imageFileId: string | null;
  imageUrl: string | null;
  backgroundColor: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
}

export interface QuickAccessToSave {
  title: string;
  description: string | null;
  imageFileId?: string;
  backgroundColor: string;
  url: string;
  isActive: boolean;
}
