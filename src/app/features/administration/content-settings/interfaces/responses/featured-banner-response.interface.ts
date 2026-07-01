export interface FeaturedBannerResponse {
  id: number;
  title: string;
  description: string | null;
  linkLabel: string | null;
  url: string | null;
  imageFileId: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FeaturedBannerToSave {
  id?: number;
  title: string;
  description?: string | null;
  linkLabel?: string | null;
  url?: string | null;
  imageFileId?: string;
  isActive: boolean;
  file?: File;
}
