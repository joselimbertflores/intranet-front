export interface TreeDirectoryResponse {
  id: number;
  name: string;
  internalPhone: string|null;
  landlinePhone: string|null;
  order: number;
  children: TreeDirectoryResponse[];
}
