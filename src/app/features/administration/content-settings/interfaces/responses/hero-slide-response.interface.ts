export interface HeroSlideResponse {
  id: number;
  title: string;
  description: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
  imageFileId: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}
