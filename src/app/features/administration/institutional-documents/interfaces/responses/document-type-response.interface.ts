export interface DocumentTypeWithSubTypesResponse {
  id: number;
  name: string;
  subtypes: DocumentSubtypeResponse[];
  isActive: boolean;
}

export interface DocumentSubtypeResponse {
  id: number;
  name: string;
  isActive: boolean;
}

export interface DocumentTypeResponse {
  id: number;
  name: string;
  isActive: boolean;
}
