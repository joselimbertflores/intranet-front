import { DocumentTypeResponse } from './document-type-response.interface';

export interface DocumentSectionWithTypesResponse {
  id: number;
  name: string;
  documentTypes: DocumentTypeResponse[];
}
