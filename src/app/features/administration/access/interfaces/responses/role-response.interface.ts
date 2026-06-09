export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  id: number;
  resource: string;
  action: string;
}

export interface GroupedPermissionResponse {
  resource: string;
  permissions: {
    id: number;
    action: string;
  }[];
}
