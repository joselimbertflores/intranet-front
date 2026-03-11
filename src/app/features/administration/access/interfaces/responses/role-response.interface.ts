export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  id: string;
  resource: string;
  action: string;
}

export interface PermissionsCatalog {
  resource: string;
  permissions: { id: number; action: string }[];
}
