import { RoleKeys } from "./authorization/role-keys";

export interface RequiredPermissions {
  required: RoleKeys[]
}

export interface MyUserProfile {
  id: string;
  email?: string;
  name: string;
  role: RoleKeys
}
