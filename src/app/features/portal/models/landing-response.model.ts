import {
  PortalCommunicationResponse,
  PortalDocumentResponse,
} from '../interfaces';

export interface HeroSlide {
  id: number;
  title: string;
  description: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
  imageUrl: string;
}

export type QuickAccessIconKey =
  | 'email'
  | 'application'
  | 'document'
  | 'book'
  | 'form'
  | 'report'
  | 'calendar'
  | 'user'
  | 'support'
  | 'finance'
  | 'vehicle'
  | 'external-link';

export interface QuickAccess {
  id: number;
  title: string;
  description: string | null;
  iconKey: QuickAccessIconKey;
  backgroundColor: string;
  url: string;
}

export interface FeaturedBanner {
  id: number;
  title: string;
  description: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
  imageUrl: string;
}

export interface LandingNotice {
  id: string;
  title: string;
  contentHtml: string | null;
  imageUrl: string | null;
  imageLinkUrl: string | null;
  updatedAt: string;
}

export interface PortalLandingResponse {
  heroSlides: HeroSlide[];
  quickAccesses: QuickAccess[];
  hasMoreQuickAccesses: boolean;
  featuredBanners: FeaturedBanner[];
  landingNotices: LandingNotice[];
  latestCommunications: PortalCommunicationResponse[];
  mostDownloadedDocuments: PortalDocumentResponse[];
}
