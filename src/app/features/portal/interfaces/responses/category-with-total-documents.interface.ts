export interface CategoryWithTotalDocumentsResponse {
  id: number;
  name: string;
  description: null | string;
  totalDocuments: number;
  documents?:any[]
}
