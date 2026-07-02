export interface LandingModalNoticeResponse {
  id: string;
  title: string;
  contentHtml: string | null;
  imageId: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageLinkUrl: string | null;
  isActive: boolean;
  visibleFrom: string | null;
  visibleUntil: string | null;
  isPinned: boolean;
  createdById: string;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LandingModalNoticeToSave {
  title: string;
  contentHtml: string | null;
  imageId?: string | null;
  imageAlt: string | null;
  imageLinkUrl: string | null;
  isActive: boolean;
  visibleFrom: Date | null;
  visibleUntil: Date | null;
  isPinned: boolean;
}
