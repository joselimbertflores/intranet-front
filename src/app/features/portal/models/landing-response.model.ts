import { PortalDocumentResponse } from '../interfaces';

export interface HeroSlide {
  id: number;
  title: string;
  description: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
  imageFileId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface QuickAccess {
  id: number;
  title: string;
  description: string | null;
  iconKey: string;
  url: string;
  sortOrder: number;
}

export interface FeaturedBanner {
  id: number;
  title: string;
  description: string | null;
  linkLabel: string | null;
  url: string | null;
  imageFileId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface LandingNotice {
  id: string;
  title: string;
  contentHtml: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageLinkUrl: string | null;
  updatedAt: string;
}

export interface PortalLandingResponse {
  heroSlides: HeroSlide[];
  quickAccesses: QuickAccess[];
  featuredBanners: FeaturedBanner[];
  landingNotices: LandingNotice[];
  communications: any[];
  mostConsultedDocuments: PortalDocumentResponse[];
}
