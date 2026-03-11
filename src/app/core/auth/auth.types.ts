export interface AuthUser {
  id: string;
  fullName: string;
  externalKey: string;
  isActive: boolean;
  roles: AuthRole[];
}

export interface AuthRole {
  id: string;
  name: string;
  permissions: AuthPermission[];
}

export interface AuthPermission {
  resource: Resource;
  action: string;
}

export enum Resource {
  USERS = 'users',
  COMMUNICATIONS = 'communications',
  DOCUMENTS = 'documents',
  TUTORIALS = 'tutorials',
  CONTENT = 'content',
}
