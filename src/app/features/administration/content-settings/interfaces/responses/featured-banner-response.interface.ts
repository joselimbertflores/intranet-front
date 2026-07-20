export interface FeaturedBannerResponse {
  id: number;
  title: string;
  description: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
  imageId: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}
