export interface QuickAccessResponse {
  id: number;
  title: string;
  description: string | null;
  iconKey: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
}

export interface QuickAccessBatchItem {
  id?: number;
  title: string;
  description?: string;
  iconKey: string;
  url: string;
  isActive: boolean;
}
