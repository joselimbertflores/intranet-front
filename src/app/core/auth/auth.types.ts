export interface AuthUser {
  id: string;
  externalKey: string;
  fullName: string;
  isActive: boolean;
  permissions: string[];
  roles?: readonly { readonly name: string }[];
}

export enum Resource {
  USERS = 'users',
  ROLES = 'roles',
  DOCUMENTS = 'documents',
  COMMUNICATIONS = 'communications',
  CALENDAR = 'calendar',
  DIRECTORY = 'directory',
  TUTORIALS = 'tutorials',
  CONTENT = 'content',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}
