export interface PortalDocumentResponse {
  id: string;
  title: string;
  year: number | null;
  organizationalUnit: string | null;
  type: string;
  subtype: string | null;
  downloadCount: number;
  createdAt: string;
  validityStatus: 'CURRENT' | 'HISTORICAL';
  file: PortalFileResponse;
}

export interface PortalFileResponse {
  name: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
}
export interface DocumentFiltersResponse {
  organizationalUnits: DocSectionFilterResponse[];
  types: DocTypeFilterResponse[];
}

export interface DocSectionFilterResponse {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children: DocSectionFilterResponse[];
}

export interface DocTypeFilterResponse {
  id: number;
  name: string;
  slug: string;
  subtypes: DocSubtypeFilterResponse[];
}

export interface DocSubtypeFilterResponse {
  id: number;
  name: string;
  slug: string;
}

export interface PortalDocumentSearchResponse {
  documents: PortalDocumentResponse[];
  total: number;
}
