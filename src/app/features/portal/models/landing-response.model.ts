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

export interface PortalLandingResponse {
  heroSlides: HeroSlide[];
  quickAccesses: QuickAccess[];
  featuredBanners: FeaturedBanner[];
}
