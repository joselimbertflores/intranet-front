export interface DocumentResponse {
  id: string;
  originalName: string;
  fiscalYear: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  sectionCategory: SectionCategory;
  fileName: string;
}

interface SectionCategory {
  id: number;
  category: Category;
}

interface Category {
  id: number;
  name: string;
}
