import { DocumentTypeResponse } from './document-type-response.interface';

export interface DocSectionManageResponse {
  id: number;
  name: string;
  documentTypes: DocumentTypeResponse[];
}
