import { UserRoles } from "@/config/routePermissions";

export interface LoginResponse {
  userName: string;
  token: string;
  role: UserRole;
  email: string;
  userId: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  identityDocument: string;
  birthDate: string;
  password: string;
  phone: string;
  roleId: number;
}

export interface User {
  userName: string;
  role: UserRole;
  email: string;
  userId: number;
}

export type UserRole = keyof typeof UserRoles;