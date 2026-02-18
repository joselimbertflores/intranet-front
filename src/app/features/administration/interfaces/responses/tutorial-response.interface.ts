export interface TutorialResponse {
  id: string;
  title: string;
  summary: string | null;
  isPublished: boolean
  blocks:any[]
}

export interface TutorialVideoResponse {
  id: number;
  title: string;
  fileUrl: string;
}
