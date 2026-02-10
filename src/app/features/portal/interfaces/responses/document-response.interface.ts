export interface DocumentResponse {
  id: string;
  displayName: string;
  originalName: string;
  fiscalYear: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  section: {
    id: number;
    name: string;
  };
  type: {
    id: number;
    name: string;
  };
  fileName: string;
}

export interface DocumentFiltersResponse {
  sections: DocSectionFilterResponse[];
  types: DocTypeFilterResponse[];
}

export interface DocSectionFilterResponse {
  id: string;
  name: string;
  slug: string;
  parentId: null | string;
  children: DocSectionFilterResponse[];
}

export interface DocTypeFilterResponse {
  id: number;
  name: string;
  slug: string;
  subtypes?: DocSubtypeFilterResponse[];
}

export interface DocSubtypeFilterResponse {
  id: number;
  name: string;
  slug: string;
}
