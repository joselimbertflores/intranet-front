export interface UserResponse {
  id: string;
  fullName: string;
  roles: UserRolesResponse[];
}

export interface UserRolesResponse {
  id: string;
  name: string;
  description: string;
}

export interface IdentityCandidateResponse {
  externalKey: string;
  fullName: string;
  email: string | null;
  login: string;
}
