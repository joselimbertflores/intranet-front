export interface TutorialResponse {
  id: string;
  title: string;
  summary: string | null;
  isPublished: boolean;
  blocks: TutorialBlockResponse[];
}

export interface TutorialBlockResponse {
  id: string;
  type: string;
  content: string | null;
  order: number;
  file?: TutorialBlockFileResponse;
}

export interface TutorialBlockFileResponse {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
}
