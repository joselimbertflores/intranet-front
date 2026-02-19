import { TutorialCategoryResponse } from './tutorial-category-response.interface';

export type TutorialBlockType =
  | 'TEXT'
  | 'VIDEO_URL'
  | 'VIDEO_FILE'
  | 'IMAGE'
  | 'FILE';

export interface TutorialResponse {
  id: string;
  title: string;
  summary: string | null;
  isPublished: boolean;
  createdAt: string;
  category: TutorialCategoryResponse;
  blocks: TutorialBlockResponse[];
}

export interface TutorialBlockResponse {
  id: string;
  type: TutorialBlockType;
  content: string | null;
  order: number;
  file?: TutorialBlockFileResponse;
}

export interface TutorialBlockFileResponse {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}
