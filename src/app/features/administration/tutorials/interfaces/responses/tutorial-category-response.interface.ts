export interface TutorialCategoryResponse {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface TutorialCategoryPayload {
  name: string;
}

export interface TutorialCategoryDeleteResponse {
  ok: true;
  message: string;
}
