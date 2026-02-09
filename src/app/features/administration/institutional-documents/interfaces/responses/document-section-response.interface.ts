import { DocumentTypeResponse } from './document-type-response.interface';

export interface DocSectionManageResponse {
  id: number;
  name: string;
  documentTypes: DocumentTypeResponse[];
}
export interface SectionTreeNodeResponse {
  id: string;
  name: string;
  slug: string;
  level: number;
  isActive: boolean;
  parentId: string | null;
  children: SectionTreeNodeResponse[];
}
