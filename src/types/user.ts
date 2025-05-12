
export type UserRole = "admin" | "leader" | "checker" | "worker";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isArchived: boolean;
}
