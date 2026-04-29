import type { OrgType } from "@/types";

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  HQ: "Головной офис",
  BRANCH: "Филиал",
  DEALER: "Дилер",
};

export const ORG_TYPE_BADGE_CLASS: Record<OrgType, string> = {
  HQ: "orgs-chip orgs-chip--brand",
  BRANCH: "orgs-chip orgs-chip--info",
  DEALER: "orgs-chip orgs-chip--success",
};

export const STATUS_FILTERS = ["all", "active", "inactive"] as const;
export const TYPE_FILTERS = ["all", "HQ", "BRANCH", "DEALER"] as const;

export const EMPTY_ORGANIZATION_FORM = {
  name: "",
  org_type: "DEALER" as OrgType,
  contact_phone: "",
  contact_email: "",
  address: "",
  region: "",
};
