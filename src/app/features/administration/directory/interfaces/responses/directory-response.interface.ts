export interface TreeDirectoryResponse {
  id: number;
  name: string;
  internalPhone: string;
  landlinePhone: null;
  order: number;
  children: TreeDirectoryResponse[];
}
