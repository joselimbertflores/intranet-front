import { TutorialCategoryResponse } from './tutorial-category-response.interface';

export enum TutorialBlockType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  YOUTUBE = 'YOUTUBE',
  VIDEO_FILE = 'VIDEO_FILE',
  FILE = 'FILE',
}

export interface TutorialFileResponse {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface TutorialBlockResponse {
  id: string;
  type: TutorialBlockType;
  order: number;
  content: string | null;
  file: TutorialFileResponse | null;
}

export interface TutorialResponse {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverImageFileId: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  category: TutorialCategoryResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface TutorialDetailResponse extends TutorialResponse {
  blocks: TutorialBlockResponse[];
}

export interface TutorialListResponse {
  tutorials: TutorialResponse[];
  total: number;
}

export interface TutorialListParams {
  term: string;
  limit: number;
  offset: number;
}

export interface TutorialCreatePayload {
  title: string;
  summary?: string | null;
  categoryId?: number | null;
  coverImageFileId?: string | null;
}

export type TutorialGeneralUpdatePayload = Partial<TutorialCreatePayload>;

export interface TutorialPublicationPayload {
  isPublished: boolean;
}

export interface TutorialBlockCreatePayload {
  type: TutorialBlockType;
  content?: string;
  fileId?: string;
}

export interface TutorialBlockUpdatePayload {
  content?: string;
  fileId?: string;
}

export interface TutorialBlockReorderPayload {
  blockIds: string[];
}

export interface TutorialBlockReorderResponse {
  ok: true;
  message: string;
}
