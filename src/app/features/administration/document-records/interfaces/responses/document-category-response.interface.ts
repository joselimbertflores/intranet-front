export interface DocumentCategoryResponse {
  id: number;
  name: string;
}

export interface DocumentCategoryWithDocumentsResponse {
  id: number;
  name: string;
  description: null | string;
  documents: DocumentItem[];
}

export interface DocumentItem {
  id: string;
  fileName: string;
  originalName: string;
}

export interface DocSectionItemResponse {
  id: number;
  name: string;
  description: null;
}

export interface CategoriesWithSectionsResponse {
  id: number;
  name: string;
  description: string | null;
  sectionCategories: SectionCategoriesResponse[];
}

export interface SectionCategoriesResponse {
  id: number;
  section: DocSectionItemResponse;
}
