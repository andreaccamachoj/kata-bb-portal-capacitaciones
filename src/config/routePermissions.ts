import { UserRole } from "@/types/autentication.interface";

export const UserRoles = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
} as const;

export function getRoleId(role:UserRole) {
  switch (role) {
    case UserRoles.ADMIN:
      return 1;
    case UserRoles.STUDENT:
      return 2;
    case UserRoles.INSTRUCTOR:
      return 3;
    default:
      return 2;
  }
}

type PermissionConfig = {
  [K: string]: UserRole[];
};

export const RoutePermissions: PermissionConfig = {
  // Rutas administrativas
  MANAGE_USERS: [UserRoles.ADMIN],
  MANAGE_MODULES: [UserRoles.ADMIN],
  MANAGE_COURSES: [UserRoles.ADMIN],
  
  // Rutas de instructor
  STUDIO_ACCESS: [UserRoles.ADMIN, UserRoles.INSTRUCTOR],
  
  // Rutas de estudiante
  VIEW_CATALOG: [UserRoles.ADMIN, UserRoles.INSTRUCTOR, UserRoles.STUDENT],
  VIEW_PROFILE: [UserRoles.ADMIN, UserRoles.INSTRUCTOR, UserRoles.STUDENT],
};