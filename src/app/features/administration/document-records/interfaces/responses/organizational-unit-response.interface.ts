export interface OrganizationalUnitResponse {
  id: number;
  name: string;
  slug: string;
  level: number;
  isActive: boolean;
  parentId: number | null;
  children: OrganizationalUnitResponse[];
}

export interface CreateOrganizationalUnitDto {
  name: string;
  parentId?: number;
  isActive?: boolean;
}

export interface UpdateOrganizationalUnitDto {
  name?: string;
  isActive?: boolean;
}
