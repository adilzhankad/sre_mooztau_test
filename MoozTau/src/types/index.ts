import i18n from "@/i18n";

// ── Auth & Users ──

export type UserRole =
  | "SUPER_ADMIN"
  | "DEALER_ADMIN"
  | "DEALER_MANAGER"
  | "USER"
  | "MASTER"
  | "FACTORY_ADMIN"
  | "FACTORY_WORKER"
  | "QC_INSPECTOR"
  | "LOGISTICS"
  | "BUYER";

// Lazy-translated via Proxy — `ROLE_LABELS[role]` returns the current language's value.
export const ROLE_LABELS: Record<string, string> = new Proxy({} as Record<string, string>, {
  get: (_target, prop: string) => i18n.t(`role.${prop}`),
});

export function roleLabel(role: UserRole | string | null | undefined): string {
  if (!role) return i18n.t("role.fallback");
  return i18n.t(`role.${role}`);
}

export type OrgType = "HQ" | "BRANCH" | "DEALER";

export interface User {
  id: number;
  organization_id: number;
  role: UserRole;
  full_name: string;
  phone: string;
  email: string | null;
  is_active: boolean;
}

export interface Organization {
  id: number;
  name: string;
  org_type: OrgType;
  is_active: boolean;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  region: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: number;
  role: UserRole;
  organization_id: number | null;
  full_name: string;
}

export interface MeResponse {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  organization_id: number | null;
  organization_name: string | null;
  is_active: boolean;
}

export interface UpdateMeRequest {
  full_name?: string;
  phone?: string;
  email?: string | null;
}

export interface ProfileSummary {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  is_active: boolean;
  member_since: string;
  organization_id: number | null;
  organization_name: string | null;
  organization_type: OrgType | null;
  organization_region: string | null;
  organization_address: string | null;
  organization_contact_phone: string | null;
  organization_contact_email: string | null;
  organization_created_at: string | null;
  teammates_count: number;
  active_teammates_count: number;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UserCreate {
  organization_id: number;
  role: UserRole;
  full_name: string;
  phone: string;
  email?: string | null;
  password: string;
}

export interface UserUpdate {
  full_name?: string;
  phone?: string;
  email?: string | null;
  role?: UserRole;
  organization_id?: number;
}

export interface OrganizationCreate {
  name: string;
  org_type: OrgType;
  contact_phone?: string | null;
  contact_email?: string | null;
  address?: string | null;
  region?: string | null;
}

export interface OrganizationUpdate {
  name?: string;
  org_type?: OrgType;
  is_active?: boolean;
  contact_phone?: string | null;
  contact_email?: string | null;
  address?: string | null;
  region?: string | null;
}

// ── Orders ──

export type OrderStatus =
  | "analysis"
  | "in_progress"
  | "qc_review"
  | "qc_passed"
  | "qc_rejected"
  | "waiting_courier"
  | "matching"
  | "master_selected"
  | "in_transit"
  | "accepted"
  | "completed"
  | "returned"
  | "cancelled"
  | "rejected";

export type DeliveryMode = "standard" | "matching";

export type ReturnType = "client" | "defect" | "delivery_issue";

export type PaymentStatus =
  | "partial"
  | "returned"
  | "prepaid"
  | "paid";

export type PaymentVerificationStatus =
  | "confirmed"
  | "review_required"
  | "risk";

export type PaymentSource =
  | "manager"
  | "buyer";

export type AnyOrderStatus = OrderStatus | PaymentStatus;

export type SalesChannel =
  | "B2B"
  | "Ауза"
  | "Айсберг"
  | "МТ Алматы"
  | "МТ Астана"
  | "MoozTau"
  | "Umag Шым"
  | "Диллер Болат"
  | "Каспи Магазин"
  | "Umag Тараз"
  | "МТ Кулан";

export type Manufacturer = "Кулан" | "Тараз";

export type UnitOfMeasure = "шт" | "метр";

export interface OrderItem {
  id: number;
  product_id: number | null;
  model: string;
  category: string | null;
  quantity: number;
  unit: string;
  length: number | null;
  height: number | null;
  width: number | null;
  color: string;
  recommended_price?: number;
  price_per_unit: number;
  discount_percent?: number;
  discount_amount?: number;
  total_price: number;
}

export interface OrderOperationalItem {
  id: number;
  product_id?: number | null;
  model: string;
  category: string | null;
  quantity: number;
  unit: string;
  length?: number | null;
  height?: number | null;
  width?: number | null;
  color: string | null;
}

export interface OrderItemCreate {
  product_id?: number | null;
  model: string;
  category: string;
  quantity: number;
  unit: string;
  length?: number | null;
  height?: number | null;
  width?: number | null;
  color?: string;
  recommended_price?: number;
  price_per_unit: number;
  discount_percent?: number;
  discount_amount?: number;
  total_price: number;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string;
  created_at: string;

  category?: string;
  note?: string;
  payment_source?: PaymentSource;
  verification_status?: PaymentVerificationStatus;
  verification_comment?: string | null;
  verified_at?: string | null;
  verified_by_name?: string | null;
}

export interface PaymentCreate {
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  category?: string;
  note?: string;
  payment_source?: PaymentSource;
  verification_status?: PaymentVerificationStatus;
}

export interface BuyerPaymentCreate {
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  note?: string;
}

export interface PaymentVerificationUpdate {
  verification_status: PaymentVerificationStatus;
  verification_comment?: string;
}

export interface StatusActionResponse {
  detail: string;
  order_id: number;
  status: OrderStatus;
}

export interface AssignCourierResponse {
  detail: string;
  courier_name: string;
}

export interface QCRejectResponse extends StatusActionResponse {
  rejection_reason: string;
}

export interface PaymentMethodReference {
  bank: string;
  person: string;
}

export interface Order {
  id: number;
  order_number: string;
  contract_number: string;
  organization_id: number;
  organization_name: string | null;
  manager_id: number;
  manager_name: string | null;
  manager_phone: string | null;
  factory: string;
  manufacturer: string | null;
  sales_channel: string | null;
  client_name: string;
  client_phone: string;
  client_iin: string;
  client_type: string;
  company_director: string;
  company_bin: string;
  company_iik: string | null;
  company_bik: string | null;
  company_bank_name: string | null;
  company_legal_address: string | null;
  client_region: string;
  client_address: string;
  delivery_address: string;
  total_amount: number;
  dealer_cost: number | null;
  discount_percent: number;
  discount_amount: number;
  final_amount: number;
  payment_type: string;
  order_date: string;
  deadline: string | null;
  accepted_date: string | null;
  warranty_end_date: string | null;
  status: OrderStatus;
  status_display?: string;
  progress?: number;
  payment_status: PaymentStatus | null;
  has_contract: boolean;
  contract_status: "created" | "scanned" | "signed" | null;
  contract_scanned_at?: string | null;
  contract_signed_at?: string | null;
  contract_signed_ip?: string | null;
  contract_signed_user_agent?: string | null;
  contract_scan_url?: string | null;
  contract_doc_url?: string | null;
  items: OrderItem[];
  payments: Payment[];
  payment_received: number;
  payment_remaining: number;
  // Logistics fields
  buyer_id: number;
  buyer_temp_password?: string | null;
  courier_name?: string | null;
  courier_phone?: string | null;
  dispatch_date?: string | null;
  dispatch_photo_url?: string | null;
  delivery_photo_url?: string | null;
  completed_at?: string | null;
  // inDriver-style matching fields
  delivery_mode?: DeliveryMode;
  master_id?: number | null;
  master_name?: string | null;
  master_phone?: string | null;
  matching_started_at?: string | null;
  master_selected_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  organization_id?: number;
  manager_id?: number;
  order_date?: string;
  delivery_mode?: DeliveryMode;
  client_name: string;
  client_phone: string;
  client_region: string;
  client_address: string;
  delivery_address?: string;
  client_iin?: string;
  client_type?: string;
  company_director?: string;
  company_bin?: string;
  company_iik?: string;
  company_bik?: string;
  company_bank_name?: string;
  company_legal_address?: string;
  contract_number?: string;
  factory?: string;
  manufacturer?: string;
  sales_channel?: string;
  payment_type?: string;
  discount_percent?: number;
  has_contract?: boolean;
  deadline?: string | null;
  items: OrderItemCreate[];
}

export interface OrderUpdate {
  client_iin?: string;
  client_type?: string;
  client_name?: string;
  client_phone?: string;
  client_region?: string;
  client_address?: string;
  delivery_address?: string;
  company_director?: string;
  company_bin?: string;
  company_iik?: string | null;
  company_bik?: string | null;
  company_bank_name?: string | null;
  company_legal_address?: string | null;
  contract_number?: string;
  factory?: string;
  manufacturer?: string;
  sales_channel?: string;
  payment_type?: string;
  discount_percent?: number;
  has_contract?: boolean;
  deadline?: string | null;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  note?: string;
  return_reason?: string;
  return_type?: ReturnType;
}

export interface OrderHistory {
  id: number;
  order_id: number;
  action: string;
  old_value: string | null;
  new_value: string | null;
  note: string | null;
  created_at: string;
  user_id: number;
  user_name?: string;
}

export interface StatusCount {
  status: OrderStatus;
  count: number;
}

// ── Products & Prices ──

export type ProductCategory =
  | "BUILT_IN"
  | "OUTDOOR"
  | "FREEZER"
  | "UNIT"
  | "DOOR"
  | "WITHOUT_UNIT";

export interface Product {
  id: number;
  category: string;
  model: string;
  name: string;
  description: string;
  unit: string;
  image_url: string | null;
  default_length: number | null;
  default_height: number | null;
  default_width: number | null;
  available_colors: string;
  is_active: boolean;
  created_at: string;
}

export interface Price {
  id: number;
  product_id: number;
  dealer_price: number | null;
  recommended_price: number | null;
  price_per_meter: number | null;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export interface ProductCreate {
  category: string;
  model: string;
  name: string;
  description?: string;
  unit: string;
  default_length?: number | null;
  default_height?: number | null;
  default_width?: number | null;
  available_colors?: string;
  image_url?: string | null;
  is_active?: boolean;
}

export interface ProductUpdate {
  category?: string;
  model?: string;
  name?: string;
  description?: string;
  unit?: string;
  default_length?: number | null;
  default_height?: number | null;
  default_width?: number | null;
  available_colors?: string;
  image_url?: string | null;
  is_active?: boolean;
}

export interface PriceCreate {
  product_id: number;
  dealer_price?: number | null;
  recommended_price?: number | null;
  price_per_meter?: number | null;
  effective_from: string;
  effective_to?: string | null;
}

export interface FinCategoryCreate {
  name: string;
  parent_id?: number | null;
}

export interface BankAccountCreate {
  name: string;
  balance?: number;
}

export interface BankAccountUpdate {
  name?: string;
  balance?: number;
}

// ── Pagination ──

export interface Paginated<T> {
  count: number;
  results: T[];
  page: number;
  page_size: number;
  pages: number;
}

export interface OrderFilters {
  search?: string;
  status?: AnyOrderStatus | AnyOrderStatus[];
  sales_channel?: string | string[];
  ordering?: string;
  organization_id?: number;
  manager_id?: number;
  region?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// ── Finance ──

export interface FinCategory {
  id: number;
  name: string;
  level: number;
  parent_id: number | null;
  full_path: string;
}

export interface BankAccount {
  id: number;
  name: string;
  balance: number;
}

export type TransactionType = "income" | "expense";

export interface FinTransaction {
  id: number;
  date: string;
  transaction_type: TransactionType;
  amount: number;
  currency: string;
  account_id: number;
  comment: string | null;
  category_l1_id: number | null;
  category_l2_id: number | null;
  category_l3_id: number | null;
  category_l4_id: number | null;
  category_l1_name?: string;
  category_l2_name?: string;
  initiator_id: number | null;
  initiator_name?: string;
  order_id: number | null;
  order_number: string | null;
  counterparty_name: string | null;
  created_at: string;
}

export interface FinTransactionCreate {
  date: string;
  transaction_type: TransactionType;
  amount: number;
  currency?: string;
  account_id: number;
  comment?: string | null;
  category_l1_id?: number | null;
  category_l2_id?: number | null;
  category_l3_id?: number | null;
  category_l4_id?: number | null;
  initiator_id?: number | null;
  order_id?: number | null;
  order_number?: string | null;
  counterparty_name?: string | null;
}

export interface TransactionFilters {
  date_from?: string;
  date_to?: string;
  type?: TransactionType;
  account_id?: number;
  category_l1_id?: number;
  initiator_id?: number;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface TransactionListResponse {
  count: number;
  results: FinTransaction[];
  page: number;
  page_size: number;
  pages: number;
}

export interface ReportSummary {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdownSub {
  name: string;
  total: number;
}

export interface CategoryBreakdown {
  category_id: number | null;
  category_name: string;
  total: number;
  subcategories: CategoryBreakdownSub[];
}

export interface InitiatorBreakdown {
  initiator_id: number | null;
  initiator_name: string;
  income: number;
  expense: number;
  net: number;
}

// ── Factory ──

export interface FactoryOrder {
  id: number;
  order_number: string;
  client_name: string;
  client_region: string | null;
  status: OrderStatus;
  status_display?: string;
  progress?: number;
  factory: string;
  order_date: string;
  deadline: string | null;
  items: OrderOperationalItem[];
  created_at: string;
  updated_at: string;
}

export interface FactoryDashboard {
  total_orders: number;
  in_progress: number;
  qc_review: number;
  qc_passed: number;
  qc_rejected: number;
  waiting_courier: number;
}

export interface InventoryItem {
  id: number;
  factory: string;
  product_id: number;
  model: string;
  color: string;
  quantity: number;
  status: string;
  updated_at: string;
}

export interface InventoryCreate {
  factory?: string;
  product_id: number;
  model: string;
  color?: string;
  quantity?: number;
  status?: string;
}

export interface InventoryUpdate {
  factory?: string;
  product_id?: number;
  model?: string;
  color?: string;
  quantity?: number;
  status?: string;
}

// ── QC ──

export type QCCheckValue = "ok" | "defect" | "incomplete" | "mismatch" | "damaged" | "not_working" | "not_applicable";
export type QCResult = "passed" | "rejected";
export type RejectionCategory = "appearance" | "completeness" | "dimensions" | "color" | "packaging" | "unit" | "other";

export interface QCChecklist {
  id?: number;
  order_id: number;
  inspector_id?: number;
  result?: QCResult;
  appearance: "ok" | "defect";
  completeness: "ok" | "incomplete";
  dimensions_match: "ok" | "mismatch";
  color_match: "ok" | "mismatch";
  serial_number: string;
  packaging: "ok" | "damaged";
  unit_test: "ok" | "not_working" | "not_applicable" | null;
  photo_urls: string;
  notes: string;
  rejection_reason?: string;
  rejection_category?: RejectionCategory;
  attempt_number?: number;
  created_at?: string;
  completed_at?: string;
  inspector_name?: string;
}

export interface QCChecklistCreate {
  appearance: "ok" | "defect";
  completeness: "ok" | "incomplete";
  dimensions_match: "ok" | "mismatch";
  color_match: "ok" | "mismatch";
  serial_number: string;
  packaging: "ok" | "damaged";
  unit_test: "ok" | "not_working" | "not_applicable" | null;
  photo_urls: string;
  notes?: string;
}

export interface QCRejectPayload {
  rejection_reason: string;
  rejection_category: RejectionCategory;
}

export interface QCQueueItem {
  id: number;
  order_number: string;
  factory: string;
  client_name: string;
  status: "qc_review";
  order_date: string;
  deadline: string | null;
  items: OrderOperationalItem[];
  created_at: string;
}

// ── Logistics ──

export interface LogisticsOrder {
  id: number;
  order_number: string;
  factory: string;
  client_name: string;
  client_phone: string;
  client_region: string;
  delivery_address: string;
  status: OrderStatus;
  status_display?: string;
  progress?: number;
  order_date: string;
  deadline: string | null;
  courier_name: string | null;
  courier_phone: string | null;
  dispatch_date: string | null;
  delivery_mode?: DeliveryMode;
  master_id?: number | null;
  master_name?: string | null;
  master_phone?: string | null;
  matching_started_at?: string | null;
  master_selected_at?: string | null;
  items: OrderOperationalItem[];
  created_at: string;
  updated_at: string;
}

export interface LogisticsDashboard {
  waiting_courier: number;
  matching?: number;
  master_selected?: number;
  in_transit: number;
  delivered_today: number;
  delivered_total: number;
}

export interface StartMatchingPayload {
  note?: string;
}

export interface StartMatchingResponse {
  detail: string;
  order_id: number;
  status: OrderStatus;
}

export interface SelectMasterPayload {
  master_id: number;
  note?: string;
}

export interface SelectMasterResponse {
  detail: string;
  order_id: number;
  status: OrderStatus;
  master_id: number;
  master_name: string;
}

export interface AssignCourierPayload {
  courier_name: string;
  courier_phone: string;
}

export interface DispatchPayload {
  dispatch_photo_url?: string;
  note?: string;
}

export interface DeliverPayload {
  delivery_photo_url?: string;
  note?: string;
}

// ── Buyer ──

export interface BuyerOrder {
  id: number;
  order_number: string;
  status: OrderStatus;
  status_display?: string;
  progress?: number;
  /** @deprecated Use status_display from the new presentation layer instead. */
  status_label: string;
  order_date: string;
  deadline?: string | null;
  accepted_date?: string | null;
  warranty_end_date?: string | null;
  dispatch_date?: string | null;
  completed_at?: string | null;
  delivery_mode?: DeliveryMode;
  master_id?: number | null;
  master_name?: string | null;
  master_phone?: string | null;
  matching_started_at?: string | null;
  master_selected_at?: string | null;
  delivery_address: string;
  final_amount: number;
  payment_received: number;
  payment_remaining: number;
  manager_name?: string | null;
  manager_phone?: string | null;
  client_name?: string | null;
  client_iin?: string | null;
  client_phone?: string | null;
  has_contract?: boolean;
  contract_status?: "created" | "scanned" | "signed" | null;
  contract_scanned_at?: string | null;
  contract_signed_at?: string | null;
  contract_signed_ip?: string | null;
  contract_signed_user_agent?: string | null;
  contract_document_hash?: string | null;
  contract_document_hash_alg?: string | null;
  contract_consent_version?: string | null;
  contract_signed_full_name?: string | null;
  contract_signed_iin_last4?: string | null;
  contract_receipt_hmac?: string | null;
  contract_doc_url?: string | null;
  contract_scan_url?: string | null;
  items: {
    model: string;
    category: string;
    quantity: number;
    unit: string;
    color: string;
    length: number | null;
    height: number | null;
    width: number | null;
  }[];
  payments: BuyerPayment[];
  created_at: string;
  updated_at: string;
}

export interface BuyerPayment {
  id: number;
  order_id?: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string;
  created_at: string;
  note?: string;
  payment_source?: PaymentSource;
  verification_status?: PaymentVerificationStatus;
  verification_comment?: string | null;
  verified_at?: string | null;
  verified_by_name?: string | null;
}

export interface BuyerStatusHistory {
  old_status: string;
  new_status: string;
  timestamp: string;
}

export interface BuyerContract {
  order_number: string;
  file_path: string;
}

// ── Audit ──

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "LOGIN"
  | "VIEW"
  | (string & {});
export type AuditResourceType =
  | "order"
  | "qc_check"
  | "transaction"
  | "product"
  | "user"
  | "inventory"
  | "organization"
  | "auth"
  | (string & {});

export interface AuditLog {
  id: string;
  event_time: string;
  user_id: number;
  user_role: string;
  organization_id: number | null;
  action: AuditAction;
  resource_type: AuditResourceType;
  resource_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string;
  request_id?: string;
  comment: string | null;
}

export interface AuditFilters {
  user_id?: number;
  resource_type?: AuditResourceType;
  action?: AuditAction;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface SuspiciousPatterns {
  mass_deletions: {
    user_id: number;
    user_role: string;
    delete_count: number;
    first_event: string;
    last_event: string;
  }[];
  night_logins: {
    user_id: number;
    user_role: string;
    event_time: string;
    ip_address: string;
  }[];
}

export type AuditLogListResponse = Paginated<AuditLog>;

export type ServiceRequestStatus =
  | "new"
  | "matching"
  | "master_selected"
  | "approval_pending"
  | "approved"
  | "in_progress"
  | "waiting_parts"
  | "completed"
  | "closed"
  | "cancelled";

export interface ServiceMaster {
  id: number;
  full_name: string;
}

export interface ServiceRequest {
  id: number;
  ticket_number: string;
  order_id: number | null;
  organization_id: number | null;
  organization_name: string | null;
  created_by_id: number;
  created_by_name: string | null;
  assigned_master_id: number | null;
  assigned_master_name: string | null;
  assigned_master_phone?: string | null;
  client_name: string;
  client_phone: string;
  product_name: string;
  serial_number: string | null;
  issue: string;
  status: ServiceRequestStatus;
  status_label?: string;
  warranty_case: boolean;
  visit_date: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestCreate {
  order_id?: number | null;
  organization_id?: number | null;
  assigned_master_id?: number | null;
  client_name: string;
  client_phone: string;
  product_name: string;
  serial_number?: string | null;
  issue: string;
  warranty_case?: boolean;
  visit_date?: string | null;
}

export interface ServiceRequestUpdate {
  assigned_master_id?: number | null;
  client_name?: string;
  client_phone?: string;
  product_name?: string;
  serial_number?: string | null;
  issue?: string;
  status?: ServiceRequestStatus;
  warranty_case?: boolean;
  visit_date?: string | null;
  resolution_notes?: string | null;
}

export interface ServiceRequestFilters {
  search?: string;
  status?: ServiceRequestStatus;
  assigned_master_id?: number;
  mine_only?: boolean;
  unassigned_only?: boolean;
  page?: number;
  page_size?: number;
}

export interface PublicServiceRequestCreate {
  client_name: string;
  client_phone: string;
  email?: string | null;
  order_id?: number | null;
  product_name: string;
  serial_number?: string | null;
  issue: string;
  warranty_case?: boolean;
  visit_date?: string | null;
}

export interface PublicServiceRequestResponse {
  request: ServiceRequest;
  account_created: boolean;
  login_phone: string;
  temporary_password?: string | null;
}

// ── Analytics ──

export interface AnalyticsOverview {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  avg_order_value: number;
}

export interface RevenueAnalytics {
  period: string;
  revenue: number;
  orders_count: number;
}

export interface OrderAnalytics {
  status: string;
  count: number;
}

export interface DealerAnalytics {
  organization_id: number;
  organization_name: string;
  region: string;
  orders_count: number;
  total_revenue: number;
  total_paid: number;
  debt: number;
}

export interface RegionAnalytics {
  region: string;
  orders_count: number;
  total_revenue: number;
}

export interface ProductAnalytics {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface PaymentAnalytics {
  method: string;
  total: number;
  count: number;
}

// ── Analytics: control layer ──────────────────────────────────────────────

export interface FunnelCanonical {
  created: number;
  paid: number;
  in_production: number;
  completed: number;
  returned: number;
  cancelled: number;
}

export interface FunnelStages {
  analysis: number;
  in_progress: number;
  qc_review: number;
  qc_passed: number;
  waiting_courier: number;
  matching: number;
  master_selected: number;
  in_transit: number;
  completed: number;
}

export interface QCTopFailedProduct {
  model: string;
  category?: string | null;
  fails: number;
}

export interface QCAnalytics {
  total_checks: number;
  total_passed: number;
  total_rejected: number;
  fail_rate: number;
  avg_attempts: number;
  auto_cancelled: number;
  top_failed_products: QCTopFailedProduct[];
}

export interface DelayedOrder {
  order_id: number;
  order_number: string;
  deadline: string | null;
  status: string;
  days_late: number;
}

export interface DeliveryAnalytics {
  avg_delivery_time_hours: number;
  avg_production_time_hours: number;
  avg_full_cycle_hours: number;
  delivered_count: number;
  delayed_count: number;
  delayed_orders: DelayedOrder[];
}

export interface ChannelStat {
  channel: string;
  orders_count: number;
  completed_count: number;
  revenue: number;
  avg_check: number;
}

export interface ChannelsAnalytics {
  channels: ChannelStat[];
}

export interface DailyRevenuePoint {
  day: string;
  orders_count: number;
  revenue: number;
}

export interface MonthlyRevenuePoint {
  month: string;
  orders_count: number;
  revenue: number;
}

export interface RevenueBreakdown {
  by_day: DailyRevenuePoint[];
  by_month: MonthlyRevenuePoint[];
}
