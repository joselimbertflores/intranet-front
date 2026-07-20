import { QuickAccessIconKey } from '../../constants/quick-access-icons';

export interface QuickAccessResponse {
  id: number;
  title: string;
  description: string | null;
  iconKey: QuickAccessIconKey;
  backgroundColor: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
}

export interface QuickAccessBatchItem {
  id?: number;
  title: string;
  description?: string;
  iconKey: QuickAccessIconKey;
  backgroundColor: string;
  url: string;
  isActive: boolean;
}
