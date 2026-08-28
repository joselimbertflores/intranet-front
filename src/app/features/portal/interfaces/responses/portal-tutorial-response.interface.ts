export enum TutorialBlockType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  YOUTUBE = 'YOUTUBE',
  VIDEO_FILE = 'VIDEO_FILE',
  FILE = 'FILE',
}

export interface TutorialCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PublicTutorialFile {
  id: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface PublicTutorialBlock {
  id: string;
  type: TutorialBlockType;
  order: number;
  content: string | null;
  file: PublicTutorialFile | null;
}

export interface PortalTutorialResponse {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImageFileId: string | null;
  coverImageUrl: string | null;
  category: TutorialCategory | null;
  createdAt: string;
}

export interface PortalTutorialDetailResponse extends PortalTutorialResponse {
  blocks: PublicTutorialBlock[];
}

export interface PortalTutorialListResponse {
  tutorials: PortalTutorialResponse[];
  total: number;
}

export interface PortalTutorialListParams {
  limit: number;
  offset: number;
  term?: string;
  category?: string;
}
