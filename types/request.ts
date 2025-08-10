import { userRoleEnum } from "@/db/schema";

// This is the allowed role type: "admin" | "keeper" | "viewer"
export type UserRole = (typeof userRoleEnum.enumValues)[number];

// A basic type for any request that has a role
export interface RoleRequest {
  role: UserRole;
}
