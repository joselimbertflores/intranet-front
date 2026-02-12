export interface PortalDocumentResponse {
  id: string;
  title: string;
  fiscalYear: string;
  createdAt: string;
  section: string;
  type: string;
  subtype: string | null;
  file: PortalFileResponse;
}

export interface PortalFileResponse {
  id: string;
  url: string;
  name: string;
  size: number;
  extension: string;
  downloadCount: number;
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
