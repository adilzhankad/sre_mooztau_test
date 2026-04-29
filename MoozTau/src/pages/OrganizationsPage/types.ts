import type { OrganizationCreate, OrgType } from "@/types";

export type OrganizationFormValues = OrganizationCreate;
export type OrganizationStatusFilter = "all" | "active" | "inactive";
export type OrganizationTypeFilter = "all" | OrgType;
