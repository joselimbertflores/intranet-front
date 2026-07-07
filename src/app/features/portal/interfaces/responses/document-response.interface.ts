export interface PortalDocumentResponse {
  id: string;
  title: string;
  year: number | null;
  organizationalUnit: string;
  documentType: string;
  documentSubtype: string | null;
  downloadCount: number;
  file: PortalFileResponse;
}

export interface PortalFileResponse {
  id: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  extension: string;
}
export interface DocumentFiltersResponse {
  organizationalUnits: DocSectionFilterResponse[];
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
