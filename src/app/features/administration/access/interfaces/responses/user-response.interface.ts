export interface UserResponse {
  id: string;
  externalKey: string;
  fullName: string;
  roles: UserRolesResponse[];
}

export interface UserRolesResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface IdentityCandidateResponse {
  externalKey: string;
  fullName: string;
  email: string | null;
  login: string;
}

export interface RoleOptionResponse {
  id: string;
  name: string;
  description: string | null;
  isAutoAssigned: boolean;
}
