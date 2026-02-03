export interface CategoriesWithSectionsResponse {
  id: number;
  name: string;
  sectionCategories: SectionCategory[];
}

interface SectionCategory {
  id: number;
  section: DocumentSectionResponse;
}

export interface DocumentSectionResponse {
  id: number;
  name: string;
}
